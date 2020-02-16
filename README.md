# Committees

Committees is an Aragon application designed to delegate certain DAO operations on a subgroup of members in order to speed them up. Each committee is created by deploying a token, token manager and voting. The Committee app allows assigning an initial group members, some voting parameters (approve percentage, quorum, etc.), and some token parameters (uniqueness, transferability, etc.).

#### 🐲 Project Stage: Rinkeby

The Committees app has been published to `open.aragonpm.eth` on the Rinkeby test network. If you experience any issues or are interested in contributing please see review our open [issues](https://github.com/p2pmodels/committees/issues).

#### 🚨 Security Review Status: pre-audit

The code in this repository has not been audited.

## How to try Committees immediately

We have a [Committees demo DAO live on Rinkeby!](https://rinkeby.aragon.org/#/trycommittees/)

### How to run Committees locally

First make sure that you have node, npm, and the Aragon CLI installed and working. Instructions on how to set that up can be found [here](https://hack.aragon.org/docs/cli-intro.html). You'll also need to have [Metamask](https://metamask.io) or some kind of web wallet enabled to sign transactions in the browser.

Git clone this repo.

```sh
git clone https://github.com/P2PModels/committees.git
```

Navigate into the `committees` directory.

```sh
cd committees
```

Install npm dependencies.

```sh
npm i
```

Deploy a dao with Committees installed on your local environment.

```sh
npm run start:ipfs:template
```

If everything is working correctly, your new DAO will be deployed and your browser will open http://localhost:3000/#/YOUR-DAO-ADDRESS. It should look something like this:

![newly deployed dao with Committees](https://raw.githubusercontent.com/P2PModels/committees/master/app/public/meta/screenshot-1.png)

You will also see the configuration for your local deployment in the terminal. It should look something like this:

```sh
    Ethereum Node: ws://localhost:8545
    ENS registry: 0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1
    APM registry: aragonpm.eth
    DAO address: YOUR-DAO-ADDRESS
```

## How to deploy Committees to an organization

Committees has been published to APM on rinkeby at `committees.open.aragonpm.eth`

To deploy to an organization you can use the [Aragon CLI](https://hack.aragon.org/docs/cli-intro.html).

```sh
aragon dao install <dao-address> committees.open.aragonpm.eth --app-init-args <minimetoken-factory> <ens-registry> <initial-manager> --environment aragon:<network>
```

| Contract in Network | `<minimetoken-factory>`                      | `<ens-registry>`                             |
|---------------------|----------------------------------------------|----------------------------------------------|
| Rinkeby             | `0xad991658443c56b3dE2D7d7f5d8C68F339aEef29` | `0x98df287b6c145399aaa709692c8d308357bc085d` |
| Mainnet             | `0xA29EF584c389c67178aE9152aC9C543f9156E2B3` | `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e` |

The `<initial-manager>` can be set to the DAO's general voting app, and `<network>` can be `local`, `rinkeby`, or `mainnet`.

Assign committee `CREATE_PERMISSIONS_ROLE` and `MANAGE_MEMBERS_ROLE` to DAO's voting app:

```sh
aragon dao acl create <dao> <committees> CREATE_COMMITTEE_ROLE <voting> <voting> --environment aragon:<network>
aragon dao acl create <dao> <committees> MANAGE_MEMBERS_ROLE <voting> <voting> --environment aragon:<network>
```

The Committees app must have the `APP_MANAGER_ROLE` permission on `Kernel` and the `CREATE_PERMISSIONS_ROLE` permission on the `ACL`. It can be set up from the Permissions native app, or through the CLI.

```sh
aragon dao acl create <dao> <dao> APP_MANAGER_ROLE <committees> <voting> --environment aragon:<network>
aragon dao acl create <dao> <acl> CREATE_PERMISSIONS_ROLE <committees> <voting> --environment aragon:<network>
```

## Structure

This boilerplate has the following structure:

```md
root
├── app
├ ├── src
├ └── package.json
├── contracts
├ ├── CommitteeManager.sol
├ └── Template.sol
├── migration
├── test
├── arapp.json
├── manifest.json
├── truffle.js
└── package.json
```

- **app**: Frontend folder. Completely encapsulated, has its own package.json and dependencies.
  - **src**: Source files.
  - [**package.json**](https://docs.npmjs.com/creating-a-package-json-file): Frontend npm configuration file.
- **contracts**: Smart Contracts folder.
  - `CommitteeManager.sol`: Aragon app contract.
  - `CommitteeHelper.sol`: Helpers to install and configure Aragon apps on a DAO.
  - `Template.sol`: [Aragon Template](https://hack.aragon.org/docs/templates-intro) to deploy a fully functional DAO.
- [**migrations**](https://truffleframework.com/docs/truffle/getting-started/running-migrations): Migrations folder.
- **test**: Tests folder.
- [**arapp.json**](https://hack.aragon.org/docs/cli-global-confg#the-arappjson-file): Aragon configuration file. Includes Aragon-specific metadata for your app.
- [**manifest.json**](https://hack.aragon.org/docs/cli-global-confg#the-manifestjson-file): Aragon configuration file. Includes web-specific configurations.
- [**truffle.js**](https://truffleframework.com/docs/truffle/reference/configuration): Truffle configuration file.
- [**package.json**](https://docs.npmjs.com/creating-a-package-json-file): Main npm configuration file.
