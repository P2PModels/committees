import React, { useState, useEffect } from 'react'
import { useAragonApi } from '@aragon/api-react'
import { DataView, Text, useTheme, textStyle } from '@aragon/ui'
import LocalIdentityBadge from '../components/LocalIdentityBadge/LocalIdentityBadge'
import AnnotatedDescription from '../components/AnnotatedDescription'

// http://localhost:39967/#/0xc0Bb2ce43F3933beadF371b6d67795BecC1E5396/0xa15cc45a8751bcc2794fdd955ec49efc9615e4cc/

import { map, first } from 'rxjs/operators'
import { format } from 'date-fns'
import { toChecksumAddress } from 'web3-utils'

const formatShortDate = date => `${format(date, 'do MMM yy')}`
const formatDate = date => `${format(date, 'do MMM yy, HH:mm')} UTC`

async function getActivities(api) {
  // Get all DAO's apps addressess
  const addresses = await api
    .getApps()
    .pipe(
      map(apps =>
        apps.map(({ proxyAddress }) => toChecksumAddress(proxyAddress))
      )
    )
    .pipe(first())
    .toPromise()
  console.log(addresses)

  // Get all transactions in which an app of this DAO is involved
  const txHashes = [
    ...new Set(
      await api
        .web3Eth('getPastLogs', {
          fromBlock: '0x0',
          address: addresses,
        })
        .pipe(map(log => log.map(({ transactionHash }) => transactionHash)))
        .toPromise()
    ),
  ]

  // Get transaction objects and filter by transactions that belong to DAO apps
  const txs = (
    await Promise.all(
      txHashes.map(txHash => api.web3Eth('getTransaction', txHash).toPromise())
    )
  ).filter(({ to }) => addresses.includes(toChecksumAddress(to)))
  console.log('txs', txs)

  // Get radspec descriptions
  const descriptions = await Promise.all(
    txs.map(tx =>
      api.describeTransaction({ to: tx.to, data: tx.input }).toPromise()
    )
  )
  console.log(descriptions)

  // If forward() is called, get the evmScript radspec description too
  const describedScripts = await Promise.all(
    descriptions.map(
      ({ description }, i) =>
        txs[i].input.startsWith('0xd948d468') && // is forward()
        api.describeScript('0x' + txs[i].input.substring(138)).toPromise()
    )
  )
  console.log(describedScripts)

  // Get transactions timestamp
  const timestamps = await Promise.all(
    txs.map(tx =>
      api
        .web3Eth('getBlock', tx.blockNumber)
        .pipe(map(({ timestamp }) => timestamp * 1000))
        .toPromise()
    )
  )

  // Buld the activities array
  const activities = txs.map((tx, i) => {
    const forwarded = !!describedScripts[i]
    if (forwarded) {
      const destination = [...describedScripts[i]].pop() // last described script
      return {
        from: toChecksumAddress(tx.from),
        description: destination.description,
        annotatedDescription: destination.annotatedDescription,
        forwarder: toChecksumAddress(tx.to),
        app: toChecksumAddress(destination.to),
        timestamp: timestamps[i],
      }
    }
    return {
      from: toChecksumAddress(tx.from),
      description: descriptions[i].description,
      annotatedDescription: descriptions[i].annotatedDescription,
      forwarder: false,
      app: toChecksumAddress(tx.to),
      timestamp: timestamps[i],
    }
  })
  console.log(activities)

  return activities
}

function ActivityLog({ heading, activities, through }) {
  return (
    <DataView
      heading={heading}
      fields={[
        { label: 'On App' },
        { label: 'Activity' },
        { label: 'Performer' },
        through && { label: 'Through' },
        { label: 'Executed' },
      ]}
      entries={activities}
      renderEntry={({
        app,
        description,
        annotatedDescription,
        from,
        forwarder,
        timestamp,
      }) => [
        <LocalIdentityBadge entity={app} />,
        <Text
          css={`
            word-break: break-word;
          `}
        >
          <AnnotatedDescription
            description={
              (description && description.description) || description
            }
            annotatedDescription={annotatedDescription}
          />
        </Text>,
        <LocalIdentityBadge entity={from} />,
        through &&
          (forwarder ? (
            <LocalIdentityBadge entity={forwarder} />
          ) : (
            <Text>Directly</Text>
          )),
        <Text
          title={formatDate(timestamp)}
          css={`
            white-space: nowrap;
          `}
        >
          {formatShortDate(timestamp)}
        </Text>,
      ]}
    />
  )
}

function CommitteeActivity({ committee }) {
  const { api, appState } = useAragonApi()
  const { isSyncing } = appState
  const theme = useTheme()
  console.log(committee)

  // const [apps, setApps] = useState([false, false])
  const [activities, setActivities] = useState([])

  // const [tm, voting] = apps
  const { address: tm, votingAddress: voting } = committee

  const tokenActivities = activities.filter(({ forwarder }) => forwarder === tm)
  const votingActivities = activities.filter(
    ({ forwarder }) => forwarder === voting
  )

  useEffect(() => {
    // api && getTokensAndVotingApps(api).then(setApps)
    api && getActivities(api).then(setActivities)
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
      />
      <ActivityLog
        activities={votingActivities}
        heading={
          <span
            css={`
              color: ${theme.surfaceContentSecondary};
              ${textStyle('label1')}
            `}
          >
            Group activities
          </span>
        }
      />
    </>
  )
}

export default CommitteeActivity
