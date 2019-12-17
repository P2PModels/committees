import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import { useAragonApi } from '@aragon/api-react'
import { DataView, useTheme, textStyle } from '@aragon/ui'
import LocalIdentityBadge from '../components/LocalIdentityBadge/LocalIdentityBadge'
import LocalAppBadge from '../components/LocalIdentityBadge/LocalAppBadge'
import AnnotatedDescription from '../components/AnnotatedDescription'

import { map } from 'rxjs/operators'
import { format } from 'date-fns'
import { toChecksumAddress, keccak256 } from 'web3-utils'

const formatShortDate = date => `${format(date, 'do MMM yy')}`
const formatDate = date => `${format(date, 'do MMM yy, HH:mm')} UTC`

function processVotingLogs(logs) {
  const filterByTopic = topic => ({ topics }) =>
    topics.includes(keccak256(topic))

  const votesStarted = logs
    .filter(filterByTopic('StartVote(uint256,address,string)'))
    .map(({ blockNumber, transactionHash, topics }) => ({
      voteId: topics[1],
      blockNumber,
      transactionHash,
    }))

  const votesCasted = logs
    .filter(filterByTopic('CastVote(uint256,address,bool,uint256)'))
    .map(({ blockNumber, data, topics }) => ({
      voteId: topics[1],
      voter: '0x' + topics[2].substring(26),
      supports: data.substring(65, 66) === '1',
      stake: '0x' + data.substring(66),
      blockNumber,
    }))

  const votesExecuted = logs
    .filter(filterByTopic('ExecuteVote(uint256)'))
    .map(({ blockNumber, topics }) => ({
      voteId: topics[1],
      blockNumber,
    }))

  return [votesStarted, votesCasted, votesExecuted]
}

async function getTransactionsFromLogs(api, apps, logs) {
  // Get all transactions in which an app is involved
  const txHashes = [
    ...new Set(logs.map(({ transactionHash }) => transactionHash)),
  ]
  // Get transaction objects and filter by transactions that belong to apps
  const txs = (await Promise.all(
    txHashes.map(txHash => api.web3Eth('getTransaction', txHash).toPromise())
  )).filter(({ to }) => apps.includes(toChecksumAddress(to)))
  return txs
}

// Get transactions timestamp
async function applyTimestamps(api, activities) {
  const timestamps = await Promise.all(
    activities.map(({ blockNumber }) =>
      api
        .web3Eth('getBlock', blockNumber)
        .pipe(map(({ timestamp }) => timestamp * 1000))
        .toPromise()
    )
  )
  return activities.map((activity, i) => ({
    ...activity,
    timestamp: timestamps[i],
  }))
}

async function getActivities(apps, api) {
  // Normalize app addressess
  const [tm, voting] = apps.map(app => toChecksumAddress(app))

  const logs = await api
    .web3Eth('getPastLogs', {
      fromBlock: '0x0',
      address: [tm, voting],
    })
    .toPromise()

  // Get voting logs
  const [votesStarted, votesCasted, votesExecuted] = processVotingLogs(logs)

  // Get a dictionary of vote creation transaction hash to supporters and detractors arrays and execution block number
  const deferredExecutions = votesStarted
    .map(({ voteId, transactionHash }) => {
      const executed = votesExecuted.find(vote => vote.voteId === voteId)
      return (
        executed && {
          transactionHash,
          blockNumber: executed.blockNumber,
          supporters: votesCasted
            .filter(casted => casted.voteId === voteId && casted.supports)
            .map(({ voter }) => voter),
          detractors: votesCasted
            .filter(casted => casted.voteId === voteId && !casted.supports)
            .map(({ voter }) => voter),
        }
      )
    })
    .filter(notFalse => notFalse)
    .reduce((result, { transactionHash, ...rest }) => {
      result[transactionHash] = rest
      return result
    }, {})

  // Obtain transactions that call to forward() in token manager and voting, and exclude non-executed votes
  const forwardedTxs = (await getTransactionsFromLogs(api, [tm, voting], logs))
    .filter(({ input }) => input.startsWith('0xd948d468')) // is forward()
    .filter(({ hash, to }) => to !== voting || deferredExecutions[hash])

  // Get the evmScript radspec description
  const describedScripts = await Promise.all(
    forwardedTxs.map(({ input }) =>
      api.describeScript('0x' + input.substring(138)).toPromise()
    )
  )

  // Buld the activities array
  const activities = forwardedTxs.map((tx, i) => {
    const destination = [...describedScripts[i]].pop() // last described script
    const deferredExecution = deferredExecutions[tx.hash]
    let activity = {
      entities: [toChecksumAddress(tx.from)],
      description: destination.description,
      annotatedDescription: destination.annotatedDescription,
      forwarder: toChecksumAddress(tx.to),
      app: toChecksumAddress(destination.to),
      blockNumber: tx.blockNumber,
    }
    if (deferredExecution) {
      activity = {
        ...activity,
        entities: deferredExecution.supporters,
        blockNumber: deferredExecution.blockNumber,
      }
    }
    return activity
  })

  return applyTimestamps(api, activities)
}

function ActivityLog({ heading, activities, isSyncing }) {
  return (
    <DataView
      heading={heading}
      fields={[
        { label: 'Entity', childStart: true },
        { label: 'Activity' },
        { label: 'On App' },
        { label: 'Executed on' },
      ]}
      status={activities ? 'default' : 'loading'}
      entries={activities || []}
      renderEntry={({
        app,
        description,
        annotatedDescription,
        entities,
        timestamp,
      }) => [
        entities.length > 1 ? (
          `${entities.length} entities`
        ) : (
          <LocalIdentityBadge entity={entities[0]} />
        ),
        <span
          css={`
            word-break: break-word;
          `}
        >
          <AnnotatedDescription
            description={description}
            annotatedDescription={annotatedDescription}
          />
        </span>,
        <LocalAppBadge appAddress={app} />,
        <span
          title={formatDate(timestamp)}
          css={`
            white-space: nowrap;
          `}
        >
          {formatShortDate(timestamp)}
        </span>,
      ]}
      renderEntryExpansion={({ entities = [] }) =>
        entities.length > 1 &&
        entities.map(supporter => <LocalIdentityBadge entity={supporter} />)
      }
      statusEmpty={<div css={textStyle('title3')}>No activities yet.</div>}
    />
  )
}

function CommitteeActivity({ committee }) {
  const { api, appState } = useAragonApi()
  const { isSyncing } = appState
  const theme = useTheme()
  const [activities, setActivities] = useState(null)
  const { address: tm, votingAddress: voting } = committee
  const tokenActivities = activities
    ? activities.filter(({ forwarder }) => forwarder === tm)
    : null
  const votingActivities = activities
    ? activities.filter(({ forwarder }) => forwarder === voting)
    : null

  useEffect(() => {
    api && getActivities([tm, voting], api).then(setActivities)
  }, [isSyncing])

  return (
    <>
      <ActivityLog
        activities={tokenActivities}
        heading={
          <span
            css={`
              color: ${theme.surfaceContentSecondary};
              ${textStyle('label1')}
            `}
          >
            Individual activities
          </span>
        }
        isSyncing={isSyncing}
      />
      <ActivityLog
        activities={votingActivities}
        heading={
          <>
            <span
              css={`
                color: ${theme.surfaceContentSecondary};
                ${textStyle('label1')}
              `}
            >
              Group activities
            </span>
            <span
              css={`
                color: ${theme.surfaceContentSecondary};
                ${textStyle('body4')};
              `}
            >
              {' '}
              (only executed votes are shown)
            </span>
          </>
        }
        isSyncing={isSyncing}
      />
    </>
  )
}

ActivityLog.propType = {
  heading: PropTypes.node,
  activities: PropTypes.array.isRequired,
}

CommitteeActivity.propType = {
  committee: PropTypes.shape({
    address: PropTypes.string,
    votingAddress: PropTypes.string,
  }),
}

export default CommitteeActivity
