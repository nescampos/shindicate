# Shindicate
**Shindicate** is an Investment Club platform to manage funds (treasury) in [Shido Network](https://shido.io/).

## Focus of this project
The focus, from our experience working with investment managers, is to make it easier for both fund managers and people with capital to work to invest in both crypto and real (off-chain) projects.


## URL and information
----
- Project URL: https://nescampos.github.io/shindicate/
- Blockchain: Shido Testnet
- Smart Contract ID: [0x4dA05ddA2F0586327E956548fd3E88a508ba2168](https://shidoscan.com/contract/0x4dA05ddA2F0586327E956548fd3E88a508ba2168)
- Wallet: For now, Metamask.

## License
----
MIT License

## Contributors
----
- [Néstor Nicolás Campos Rojas](https://www.linkedin.com/in/nescampos/)

## Available options

What you can currently do in this version is:
- **Create investment clubs**: Just define a name, and a minimum amount to join, and the club will be associated with the account of the user who creates it (owner).
- **Join or leave clubs**: Anyone with a Shido Network account can join the available investment clubs, as well as leave one, with just a couple of clicks.
- **Contribute to the club**: Any member of a club can contribute to the common fund (pool), depositing SHIDO that can be used in proposals.
- **Create and Vote on Proposals**: Any member who has contributed funds to the club pool can create proposals, giving a description, amount (not to exceed the pool amount), and recipient, with a view to investing in any business/person in a project. Also, all members can approve or reject the proposal (only one vote per member is allowed on each proposal).
- **Run Proposals**: A proposal owner can execute a proposal (if approval is greater than rejection), which will cause the proposal amount to be sent to the specified recipient. The owner can also close a proposal, in case of not continuing with it, either as a cancellation, publication error or to avoid sending funds.

### New features to build

New functions:
- Integration with other wallets.
- Add more parameters to create clubs (limit number of users, proposal rules, etc.).
- Allow private clubs.
- Enable more tokens.
- Lock time and vesting.
- Add payments on/off ramps.
- And more.


## Technologies
This project use:
- HTML y Javascript
- [Web3 JS SDK](https://web3js.readthedocs.io/en/v1.10.0/)
- Solidity Smart Contract

## Use this project

You just need an Internet connection, but this web app works in a web server or ngrok(in a local environment).

### Change the project
If you want to adjust the project, you have the following options:

#### Smart contract
- To change the smart contract, you can use [the current one as a reference in the contracts folder](./contracts/InvestmentClub.sol) and then publish it on the network.
- After you publish it, you must copy the ABI code of the contract in the [constants.js](./js/constants.js) file, in the _contractABI_ variable, and also, in the _investmentContractAddress_ variable, the address of your contract in the network.

#### Network
This versions is enabled in the testnet. 
If you want to enable the mainnet, modify the [main.js file](./js/main.js), line 1, adding the mainnet URL.

#### Methods and design
To adjust the interaction logic in the app, you must make the changes in the [main.js file](./js/main.js) file.

While if you want to adjust the layout, you have to adjust the various .html files and style sheets, available in the [css folder](./css).

## Contributions

If you want to colaborate, just fork this repository and build new things. Thanks!!
