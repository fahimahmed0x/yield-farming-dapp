const { assert } = require('chai')

const DappToken = artifacts.require("DappToken")
const DaiToken = artifacts.require("DaiToken")
const TokenFarm = artifacts.require("TokenFarm")

require('chai')
    .use(require('chai-as-promised'))
    .should()

    // owner is accounts[0], investor is accounts[1]
contract('TokenFarm', ([owner, investor]) => {
    let daiToken, dappToken, tokenFarm

    before(async () => {
        // Load Contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        // Transfer all Dapp tokens to farm (1 million)
        await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

        // Send tokens to investor from deployment address (100)
        await daiToken.transfer(investor, '100000000000000000000', { from: owner })
    })

    describe('Mock DAI deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('DApp Token deployment', async () => {
        it('has a name', async () => {
            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Token Farm deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name()
            assert.equal(name, 'Dapp Token Farm')
        })

        it('contract has tokens', async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), '1000000000000000000000000')
        })
    })

    describe('Farming tokens', async () => {
        it('rewards investors for staking mDai tokens', async () => {
            let result
            
            // check investor balance before staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), '100000000000000000000', 'investor Mock DAI wallet balance correct before staking')

            // stake Mock Dai tokens
            // transaction must be approved before it is staked.
            await daiToken.approve(tokenFarm.address, '100000000000000000000', { from: investor })
            await tokenFarm.stakeTokens('100000000000000000000', { from: investor })

            // check staking result
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), '0', 'investor Mock DAI wallet balance correct after staking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), '100000000000000000000', 'Token Farm Mock DAI wallet balance correct after staking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), '100000000000000000000', 'investor staking balance correct after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor staking status correct after staking')
        })
    })
})