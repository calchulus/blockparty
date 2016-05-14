contract('Conference', function(accounts) {
  describe('on creation', function(){
    it('shold have name', function(done){
      var meta = Conference.deployed();
      meta.name.call().then(function(name) {
        assert.equal(name, 'CodeUp');
      }).then(done).catch(done);
    })

    it('shold have registered', function(done){
      var meta = Conference.deployed();
      meta.registered.call().then(function(value) {
        assert.equal(value, 0);
      }).then(done).catch(done);
    })

    it('shold have attended', function(done){
      var meta = Conference.deployed();
      meta.attended.call().then(function(value) {
        assert.equal(value, 0);
      }).then(done).catch(done);
    })

    it('shold have balance', function(done){
      var meta = Conference.deployed();
      meta.balance.call().then(function(value) {
        assert.equal(value, 0);
      }).then(done).catch(done);
    })
  })

  describe('on registration', function(){
    it('shold increment registered', function(done){
      var meta = Conference.deployed();
      var account = accounts[0]
      var transaction = Math.pow(10,18);
      meta.register.sendTransaction({value:transaction}).then(function() {
        return meta.registered.call();
      })
      .then(function(value){
        assert.equal(value, 1);
      })
      .then(done).catch(done);
    })

    it('shold increase balance', function(done){
      var meta = Conference.deployed();
      var account = accounts[0]
      var beforeContractBalance = web3.eth.getBalance(meta.address);
      var transaction = Math.pow(10,18);
      meta.register.sendTransaction({value:transaction}).then(function() {
        return meta.balance.call();
      })
      .then(function(value){
        assert.equal(value.toString() - beforeContractBalance, transaction);
      })
      .then(done).catch(done);
    })

    it('shold be registered for same account', function(done){
      var meta = Conference.deployed();
      var account = accounts[0]
      var transaction = Math.pow(10,18);
      meta.register.sendTransaction({value:transaction}).then(function() {
        return meta.isRegistered.call();
      })
      .then(function(value){
        assert.equal(value, true);
      })
      .then(done).catch(done);
    })

    it('shold not be registered for different accounts', function(done){
      var meta = Conference.deployed();
      var transaction = Math.pow(10,18);
      meta.register.sendTransaction({from:accounts[1], value:transaction}).then(function() {
        return meta.isRegistered.call({from:accounts[2]});
      })
      .then(function(value){
        assert.equal(value, false);
      })
      .then(done).catch(done);
    })

    // Need to find out how to test when error is thrown.
    // http://stackoverflow.com/questions/36595575/what-is-the-pattern-for-handling-throw-on-a-solidity-contract-in-tests
    // https://ethereum.stackexchange.com/questions/2505/catch-on-throw-from-contract
    // it('shold throw error if 1 Ether is not sent', function(done){
    //   var meta = Conference.deployed();
    //   var account = accounts[0]
    //   var beforeAccountBalance = web3.eth.getBalance(account)
    //   var badTransaction = 5;
    //   meta.register.sendTransaction({from:account, value:badTransaction}).then(function() {
    //     var  accountBalance = web3.eth.getBalance(account)
    //      sender balance
    //     assert.equal(accountBalance.toString(), beforeAccountBalance.toString());
    //     contract balance
    //     var  contractBalance = web3.eth.getBalance(meta.address)
    //     assert.equal(contractBalance.toString(), 0);
    //   }).then(done).catch(done);
    // })
  })

  describe('on attend', function(){
    it('shold be attended', function(done){
      var meta = Conference.deployed();
      var transaction = Math.pow(10,18);
      meta.register.sendTransaction({value:transaction}).then(function() {
        return meta.attend.sendTransaction()
      }).then(function(){
        return meta.isAttended.call()
      }).then(function(value){
        assert.equal(value, true)
      }).then(function(){
        return meta.attended.call()
      }).then(function(value){
        assert.equal(value, 1)
      })
      .then(done).catch(done);
    })

    it('shold not be attended if have not called attended function', function(done){
      var meta = Conference.deployed();
      var transaction = Math.pow(10,18);
      meta.register.sendTransaction({value:transaction}).then(function() {
        return meta.isAttended.call()
      }).then(function(value){
        assert.equal(value, false)
      })
      .then(done).catch(done);
    })
  })
});

// Create new contract to reset data.
contract('Conference2', function(accounts) {
  describe('on payback', function(){
    it('shold be attended', function(done){
      var meta = Conference.deployed();
      var transaction = web3.toWei(1, "ether");
      var gas = 1000000;
      var previousBalances = [];
      previousBalances[0] = web3.eth.getBalance(accounts[0]);
      previousBalances[1] = web3.eth.getBalance(accounts[1]);
      previousBalances[2] = web3.eth.getBalance(accounts[2]);

      var balanceDiff = function(index){
        return web3.fromWei(previousBalances[index], "ether") - web3.fromWei(web3.eth.getBalance(accounts[index]), "ether")
      }
      // 3 registrations
      meta.register.sendTransaction({from:accounts[0], value:transaction, gas:gas}).then(function() {
        return meta.register.sendTransaction({from:accounts[1], value:transaction, gas:gas})
      }).then(function(){
        return meta.register.sendTransaction({from:accounts[2], value:transaction, gas:gas})
      }).then(function(){
        // contract gets 3 ethers
        assert.equal( web3.eth.getBalance(meta.address), web3.toWei(3, "ether"))
        // only account 0 and 1 attend
      }).then(function(){
        return meta.attend.sendTransaction({from:accounts[0], gas:gas})
      }).then(function(){
        return meta.attend.sendTransaction({from:accounts[1], gas:gas})
        // payback gets 3 ehter / 2 = 1.5 each
      }).then(function(){
        return meta.payback.sendTransaction({from:accounts[4], gas:gas})
      }).then(function(){
        // no money is left on contract
        assert.equal( web3.eth.getBalance(meta.address), web3.toWei(0, "ether"))
        console.log('0', web3.fromWei(web3.eth.getBalance(accounts[0]), "ether").toString())
        console.log('1', web3.fromWei(web3.eth.getBalance(accounts[1]), "ether").toString())
        console.log('2', web3.fromWei(web3.eth.getBalance(accounts[2]), "ether").toString())
        assert.equal(balanceDiff(0), 0.5)
        assert.equal(balanceDiff(1), 0.5)
        assert.equal(balanceDiff(2), -1)
      })
      .then(done).catch(done);
    })
  })
})



// Testing them from `truffle console`
// var meta = Conference.deployed();
// web3.eth.defaultAccount = web3.eth.accounts[0];
// meta.registered.call().then(function(value) {
//   console.log('value', value.toString());
// })
