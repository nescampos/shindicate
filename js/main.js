var urlRPC = "https://rpc-testnet-nodes.shidoscan.com";
var currency = "SHIDO";
var networkName = "Shido Testnet"
const chainId = 9007;
const milisecondsToWait = 16000;

var web3 = new Web3(new Web3.providers.HttpProvider(urlRPC));
const MMSDK = new MetaMaskSDK.MetaMaskSDK();

var contractPublic = null;
var account = null;
var iface = new ethers.utils.Interface(contractABI);

async function autenticate() {
  await loginWithMetamask();
  location.href = "index.html";
}

async function loginWithMetamask() {
  //const ethereum = MMSDK.getProvider() // You can also access via window.ethereum
  try {
    var accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
    account = accounts[0];
    $('.current_account_text').text(account);
    await changeNetwork();

  } catch {
    location.href = "login.html";
  }
  
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function changeNetwork() {
  

  if (window.ethereum.networkVersion !== chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: web3.utils.toHex(chainId) }]
          });
        } catch (err) {
            // This error code indicates that the chain has not been added to MetaMask
          if (err.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainName: networkName,
                  chainId: web3.utils.toHex(chainId),
                  nativeCurrency: { name: currency, decimals: 18, symbol: currency },
                  rpcUrls: [urlRPC]
                }
              ]
            });
          }

          if (err.code === 4001) {
            location.href = "login.html";
          }
        }
      }
}

async function getContract(userAddress) {
  contractPublic = await new web3.eth.Contract(contractABI,investmentContractAddress);
  if(userAddress != null && userAddress != undefined) {
    contractPublic.defaultAccount = userAddress;
  }
}

async function getClubs() {
  await loginWithMetamask();
  await getContract(account);
  if(contractPublic != undefined) {
    var clubs = await ethereum
    .request({
      method: 'eth_call',
      params: [
        {
          from: account, // The user's active address.
          data: contractPublic.methods.listClubs().encodeABI(),
          to: investmentContractAddress
        },
      ],
    });
    clubs = iface.decodeFunctionResult("listClubs", clubs);
    if(clubs.length > 0) {

      var list = document.querySelector('.available_clubs');
        var table = document.createElement('table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        var theadTr = document.createElement('tr');
        var balanceHeader = document.createElement('th');
        balanceHeader.innerHTML = 'ID';
        theadTr.appendChild(balanceHeader);
        var contractNameHeader = document.createElement('th');
        contractNameHeader.innerHTML = 'Name';
        theadTr.appendChild(contractNameHeader);
        var contractTickerHeader = document.createElement('th');
        contractTickerHeader.innerHTML = 'Members';
        theadTr.appendChild(contractTickerHeader);
        
        var usdHeader = document.createElement('th');
        usdHeader.innerHTML = 'Proposals';
        theadTr.appendChild(usdHeader);

        thead.appendChild(theadTr)

        table.className = 'table';
        table.appendChild(thead);

      clubs[0].forEach((valor, clave) => {
        var tbodyTr = document.createElement('tr');
        var contractTd = document.createElement('td');
        contractTd.innerHTML = "<a class='btn btn-success' onclick='changeClub(" + valor.clubId + ")''>"+valor.clubId+"</a>";
        tbodyTr.appendChild(contractTd);
        var contractTickerTd = document.createElement('td');
        contractTickerTd.innerHTML = '<b>' + valor.name + '</b>';
        tbodyTr.appendChild(contractTickerTd);
        var balanceTd = document.createElement('td');
        balanceTd.innerHTML = '<b>' + valor.memberCount + '</b>';
        tbodyTr.appendChild(balanceTd);
        var balanceUSDTd = document.createElement('td');
        balanceUSDTd.innerHTML = '<b>' + valor.proposalCount+ '</b>';
        tbodyTr.appendChild(balanceUSDTd);
        tbody.appendChild(tbodyTr);
      });

      table.appendChild(tbody);

        list.appendChild(table);
    }
    $('.loading_message').css('display','none');
  }
}

async function runProposal() {
  await loginWithMetamask();
  await getContract(account);
  if(contractPublic != undefined) {
    var option_execution = $('#option_execution').val()
    if(option_execution == '') {
      $('.errorExecution').css("display","block");
      $('.errorExecution').text("Option is required");
      return;
    }
    var clubId = localStorage.getItem("clubId");
    var proposalId = localStorage.getItem("proposalId");
    
      $('.errorExecution').css("display","none");
      $('.successExecution').css("display","block");
      $('.successExecution').text("Running...");
        try {
          if(option_execution == 'execute') {
            const query = contractPublic.methods.executeProposal(clubId,proposalId);
            const encodedABI = query.encodeABI();
            const gasPrice = web3.utils.toHex(await web3.eth.getGasPrice());
            var clubId = await ethereum
              .request({
                method: 'eth_sendTransaction',
                params: [
                  {
                    from: account, 
                    to: investmentContractAddress,
                    data: encodedABI,
                    gasLimit: '0x5208', // Customizable by the user during MetaMask confirmation.
                    maxPriorityFeePerGas: gasPrice, // Customizable by the user during MetaMask confirmation.
                    //maxFeePerGas: gasPrice, // Customizable by the user during MetaMask confirmation.
                  },
                ],
              });
            await sleep(milisecondsToWait);

              var clubCreated = await web3.eth.getTransactionReceipt(clubId);
              if(clubCreated == null) {
                $('.successExecution').css("display","none");
                $('.errorExecution').css("display","block");
                $('.errorExecution').text("Error executing/closing the club");
                return;
              }
            
          } else {
            if(option_execution == 'close') {
              const query = contractPublic.methods.closeProposal(clubId,proposalId);
              const encodedABI = query.encodeABI();
              const gasPrice = web3.utils.toHex(await web3.eth.getGasPrice());
              var clubId = await ethereum
              .request({
                method: 'eth_sendTransaction',
                params: [
                  {
                    from: account, 
                    to: investmentContractAddress,
                    data: encodedABI,
                    gasLimit: '0x5208', // Customizable by the user during MetaMask confirmation.
                    maxPriorityFeePerGas: gasPrice, // Customizable by the user during MetaMask confirmation.
                    //maxFeePerGas: gasPrice, // Customizable by the user during MetaMask confirmation.
                  },
                ],
              });
              await sleep(milisecondsToWait);

              var clubCreated = await web3.eth.getTransactionReceipt(clubId);
              if(clubCreated == null) {
                $('.successExecution').css("display","none");
                $('.errorExecution').css("display","block");
                $('.errorExecution').text("Error executing/closing the club");
                return;
              }
            }
          }
          
        } catch (error) {
          $('.successExecution').css("display","none");
          $('.errorExecution').css("display","block");
          $('.errorExecution').text("Error executing/closing the proposal");
          return;
        }
        
        $('#option_execution').val('');
        $('#passwordShowPVExecution').val('');
        $('.errorExecution').css("display","none");
        $('.successExecution').css("display","block");
        $('.successExecution').text("The execution was successful ");
        location.reload();
    
    
  }
}

async function getProposalById(){
  await loginWithMetamask();
  await getContract(account);
  if(contractPublic != undefined) {
    var clubId = localStorage.getItem("clubId");
    var proposalId = localStorage.getItem("proposalId");
    var clubs = await ethereum
    .request({
      method: 'eth_call',
      params: [
        {
          from: account, // The user's active address.
          data: contractPublic.methods.getProposalById(clubId, proposalId).encodeABI(),
          to: investmentContractAddress
        },
      ],
    });
    clubs = iface.decodeFunctionResult("getProposalById", clubs);
    if(clubs[0] != undefined) {

      $('.proposal_description').text(clubs[0].description);
      $('#proposal_creator').text(clubs[0].creator);
      $('#proposal_destination').text(clubs[0].destination);
      $('#proposal_amount').text(web3.utils.fromWei(clubs[0].amount,"ether"));
      $('#proposal_status').text(clubs[0].status);
      $('#votes_for').text(clubs[0].votesFor);
      $('#votes_against').text(clubs[0].votesAgainst);
      
      if(clubs[0].status == 'Pending' && clubs[0].creator.toLowerCase() == account.toLowerCase()) {
        $('.creator_options').css('display','block');
      }
      if(clubs[0].status != 'Pending') {
        $('.votes_available').css('display','none');
      }


    }
    $('.loading_message').css('display','none');
  }
}

async function getCommentsByProposal() {
  await loginWithMetamask();
  await getContract(account);
  if(contractPublic != undefined) {
    var clubId = localStorage.getItem("clubId");
    var proposalId = localStorage.getItem("proposalId");
    var clubs = await ethereum
    .request({
      method: 'eth_call',
      params: [
        {
          from: account, // The user's active address.
          data: contractPublic.methods.getComments(proposalId, clubId).encodeABI(),
          to: investmentContractAddress
        },
      ],
    });
    clubs = iface.decodeFunctionResult("getComments", clubs);
    if(clubs.length > 0) {
      $('.list_comments').html('');
      var list = document.querySelector('.list_comments');
        var table = document.createElement('table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        var theadTr = document.createElement('tr');
        var balanceHeader = document.createElement('th');
        balanceHeader.innerHTML = 'Comment';
        theadTr.appendChild(balanceHeader);
        var contractNameHeader = document.createElement('th');
        contractNameHeader.innerHTML = 'By';
        theadTr.appendChild(contractNameHeader);
        
        thead.appendChild(theadTr)

        table.className = 'table';
        table.appendChild(thead);

      clubs[0].forEach((valor, clave) => {
        var tbodyTr = document.createElement('tr');
        var contractTd = document.createElement('td');
        contractTd.innerHTML = "<b>"+valor.text+"</b>";
        tbodyTr.appendChild(contractTd);
        var contractTickerTd = document.createElement('td');
        contractTickerTd.innerHTML = '<b>' + valor.commenter + '</b>';
        tbodyTr.appendChild(contractTickerTd);
        tbody.appendChild(tbodyTr);
      });

      table.appendChild(tbody);

        list.appendChild(table);
    }
    $('.loading_message').css('display','none');
  }
}

async function voteOnProposal() {
  await loginWithMetamask();
  await getContract(account);
  if(contractPublic != undefined) {
    var option_vote = $('#option_vote').val()
    if(option_vote == '') {
      $('#errorCreateProposal').css("display","block");
      $('#errorCreateProposal').text("Vote is required");
      return;
    }
    var clubId = localStorage.getItem("clubId");
    var proposalId = localStorage.getItem("proposalId");
      $('.successVote').css("display","block");
      $('.successVote').text("Voting...");
      var optionBool = option_vote == '1' ? true : false;
      try {
        const query = contractPublic.methods.voteOnProposal(clubId,proposalId, optionBool);
        const encodedABI = query.encodeABI();
        const gasPrice = web3.utils.toHex(await web3.eth.getGasPrice());
        var clubId = await ethereum
              .request({
                method: 'eth_sendTransaction',
                params: [
                  {
                    from: account, 
                    to: investmentContractAddress,
                    data: encodedABI,
                    gasLimit: '0x5208', // Customizable by the user during MetaMask confirmation.
                    maxPriorityFeePerGas: gasPrice, // Customizable by the user during MetaMask confirmation.
                    //maxFeePerGas: gasPrice, // Customizable by the user during MetaMask confirmation.
                  },
                ],
              });

          await sleep(milisecondsToWait);

          var clubCreated = await web3.eth.getTransactionReceipt(clubId);
          if(clubCreated == null) {
            $('.successVote').css("display","none");
            $('.errorVote').css("display","block");
            $('.errorVote').text("Error voting on the proposal");
            return;
          }
      } catch (error) {
        $('.successVote').css("display","none");
        $('.errorVote').css("display","block");
        $('.errorVote').text("You already voted on this proposal");
        return;
      }
      
      $('#option_vote').val('');
      $('#passwordShowPVVote').val('');
      $('#errorVote').css("display","none");
      $('#successVote').css("display","block");
      $('#successVote').text("Your vote was successful ");
      location.reload();
    
  }
}

async function getProposals() {
  await loginWithMetamask();
  await getContract(account);
  if(contractPublic != undefined) {
    var clubId = localStorage.getItem("clubId");
    var clubs = await ethereum
      .request({
        method: 'eth_call',
        params: [
          {
            from: account, // The user's active address.
            data: await contractPublic.methods.getProposalsByClub(clubId).encodeABI(),
            to: investmentContractAddress
          },
        ],
      });
    clubs = iface.decodeFunctionResult("getProposalsByClub", clubs);
    if(clubs.length > 0) {

      var list = document.querySelector('.available_proposals');
        var table = document.createElement('table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        var theadTr = document.createElement('tr');
        var balanceHeader = document.createElement('th');
        balanceHeader.innerHTML = 'ID';
        theadTr.appendChild(balanceHeader);
        var contractNameHeader = document.createElement('th');
        contractNameHeader.innerHTML = 'Description';
        theadTr.appendChild(contractNameHeader);
        var contractTickerHeader = document.createElement('th');
        contractTickerHeader.innerHTML = 'Amount (' + currency + ')';
        theadTr.appendChild(contractTickerHeader);
        

        var usdHeader2 = document.createElement('th');
        usdHeader2.innerHTML = 'Status';
        theadTr.appendChild(usdHeader2);

        thead.appendChild(theadTr)

        table.className = 'table';
        table.appendChild(thead);

      clubs[0].forEach((valor, clave) => {
        var tbodyTr = document.createElement('tr');
        var contractTd = document.createElement('td');
        contractTd.innerHTML = "<a class='btn btn-success' onclick='changeProposal(" + valor.id + ")'>"+valor.id+"</a>";
        tbodyTr.appendChild(contractTd);
        var contractTickerTd = document.createElement('td');
        contractTickerTd.innerHTML = '<b>' + valor.description + '</b>';
        tbodyTr.appendChild(contractTickerTd);
        var balanceTd = document.createElement('td');
        balanceTd.innerHTML = '<b>' + web3.utils.fromWei(valor.amount,"ether")  + '</b>';
        tbodyTr.appendChild(balanceTd);
        var balanceUSDTd2 = document.createElement('td');
        balanceUSDTd2.innerHTML = '<b>' + valor.status+ '</b>';
        tbodyTr.appendChild(balanceUSDTd2);
        tbody.appendChild(tbodyTr);
      });

      table.appendChild(tbody);

        list.appendChild(table);
    }
    $('.loading_message').css('display','none');
  }
}

function changeClub(clubId) {
  localStorage.setItem("clubId",clubId);
  window.location.href = "club.html";
}

function changeProposal(proposalId) {
  localStorage.setItem("proposalId",proposalId);
  window.location.href = "proposal.html";
}

async function verifyUserInClub() {
  await loginWithMetamask();
  await getContract(account);
  var clubId = localStorage.getItem("clubId");
  if(clubId != null) {
    if(contractPublic != undefined) {
      var user = await ethereum
        .request({
          method: 'eth_call',
          params: [
            {
              from: account, // The user's active address.
              data: contractPublic.methods.isMemberOfClub(account,clubId).encodeABI(),
              to: investmentContractAddress
            },
          ],
        });
        user = iface.decodeFunctionResult("isMemberOfClub", user);
      if(user[0]) {
        $('.join_club').css('display','none');
        $('.leave_club').css('display','block');
      } else {
        $('.join_club').css('display','block');
        $('.leave_club').css('display','none');
      }
    }
  }
}

async function createProposal() {
  await loginWithMetamask();
  await getContract(account);
  if(contractPublic != null) {
    var proposal_description = $('#proposal_description').val();
    var proposal_address = $('#proposal_address').val();
    var proposal_amount = $('#proposal_amount').val();
    if(proposal_description == '') {
      $('#errorCreateProposal').css("display","block");
      $('#errorCreateProposal').text("Description is required");
      return;
    }
    if(proposal_address == '') {
      $('#errorCreateProposal').css("display","block");
      $('#errorCreateProposal').text("Destination address is required");
      return;
    }
    if(proposal_amount == '') {
      $('#errorCreateProposal').css("display","block");
      $('#errorCreateProposal').text("Amount is required");
      return;
    }
    var clubId = localStorage.getItem("clubId");
      $('.loading_message_creating').css("display","block");
      proposal_amount = web3.utils.toWei(proposal_amount,"ether");
      const query = contractPublic.methods.createProposal(clubId,proposal_amount, proposal_address, proposal_description);
      const encodedABI = query.encodeABI();
      const gasPrice = web3.utils.toHex(await web3.eth.getGasPrice());
      var clubId = await ethereum
              .request({
                method: 'eth_sendTransaction',
                params: [
                  {
                    from: account, 
                    to: investmentContractAddress,
                    data: encodedABI,
                    gasLimit: '0x5208', // Customizable by the user during MetaMask confirmation.
                    maxPriorityFeePerGas: gasPrice, // Customizable by the user during MetaMask confirmation.
                    //maxFeePerGas: gasPrice, // Customizable by the user during MetaMask confirmation.
                  },
                ],
              });
      await sleep(milisecondsToWait);

      var clubCreated = await web3.eth.getTransactionReceipt(clubId);
      if(clubCreated == null) {
        $('#successCreateProposal').css("display","none");
        $('#errorCreateProposal').css("display","block");
        $('#errorCreateProposal').text("Error creating the proposal");
        return;
      }
      $('#proposal_description').val('');
      $('#proposal_address').val('');
      $('#proposal_amount').val('');
      $('#trx_password').val('');
      $('#errorCreateProposal').css("display","none");
      $('.loading_message_creating').css("display","none");
      $('#successCreateProposal').css("display","block");
      $('#successCreateProposal').text("Proposal created successfully with description: " + proposal_description);
    
    
  }
}


async function createClub() {
  await loginWithMetamask();
  await getContract(account);
  if(contractPublic != null) {
    var clubName = $('#club_name').val();
    if(clubName == '') {
      $('#errorCreateClub').css("display","block");
      $('#errorCreateClub').text("Club name is invalid");
      return;
    }
    var minimumToEnter = $('#club_minimum').val();
    if(minimumToEnter == '' || minimumToEnter < 0) {
      $('#errorCreateClub').css("display","block");
      $('#errorCreateClub').text("The minimum to join is not valid.");
      return;
    }
    try
    {
      $('.loading_message_creating').css("display","block");
      minimumToEnter = web3.utils.toWei(minimumToEnter,"ether");
      const query = contractPublic.methods.createClub(clubName, minimumToEnter);
      const encodedABI = query.encodeABI();
      const gasPrice = web3.utils.toHex(await web3.eth.getGasPrice());
      var clubId = await ethereum
              .request({
                method: 'eth_sendTransaction',
                params: [
                  {
                    from: account, 
                    to: investmentContractAddress,
                    data: encodedABI,
                    gasLimit: '0x5208', // Customizable by the user during MetaMask confirmation.
                    maxPriorityFeePerGas: gasPrice, // Customizable by the user during MetaMask confirmation.
                    //maxFeePerGas: gasPrice, // Customizable by the user during MetaMask confirmation.
                  },
                ],
              });
      await sleep(milisecondsToWait);
      
      var clubCreated = await web3.eth.getTransactionReceipt(clubId);
      if(clubCreated == null) {
        $('#successCreateClub').css("display","none");
        $('.invalid-feedback').css("display","block");
        $('.invalid-feedback').text("Error creating the club");
        return;
      }
      
      $('#club_name').val('');
      $('#club_minimum').val('');
      $('#errorCreateClub').css("display","none");
      $('.loading_message_creating').css("display","none");
      $('#successCreateClub').css("display","block");
      $('#successCreateClub').text("Club created successfully with the name: " + clubName);
    } catch(e) {
      $('.valid-feedback').css('display','none');
        $('.invalid-feedback').css('display','block');
        $('.loading_message_creating').css("display","none");
        $('.invalid-feedback').text(e.message);
    }
    
    
  }
}

async function getClub() {
  await loginWithMetamask();
  await getContract(account);
  var clubId = localStorage.getItem("clubId");
  if(clubId != null) {
    await getContract();
    if(contractPublic != undefined) {
      var club = await ethereum
        .request({
          method: 'eth_call',
          params: [
            {
              from: account, // The user's active address.
              data: contractPublic.methods.getClubById(clubId).encodeABI(),
              to: investmentContractAddress
            },
          ],
        });
        club = iface.decodeFunctionResult("getClubById", club);
      if(club[0] != null) {
        $('.club_name').text(club[0].name);
        $('#club_id').text(club[0].id);
        $('.club_members').text(club[0].memberCount);
        $('.club_minimum').text(web3.utils.fromWei(club[0].minimumToEnter,"ether"));
        $('.club_proposals').text(club[0].proposalCount);
        $('.club_balance').text(web3.utils.fromWei(club[0].pool,"ether"));
      }
    }
  }
}



async function joinClub() {
  await loginWithMetamask();
  await getContract(account);
  $('.successJoinLeaveClub').css('display','none');
  $('.errorJoinLeaveClub').css('display','none');
  var clubId = localStorage.getItem("clubId");
    if(clubId != null) {
      var minimumToEnter = $('#amountJoin').val();
      if(minimumToEnter == '' || minimumToEnter < 0) {
        $('.errorJoinLeaveClub').css("display","block");
        $('.errorJoinLeaveClub').text("The amount to join is not valid.");
        return;
      }
      $('.successJoinLeaveClub').css("display","block");
        $('.successJoinLeaveClub').text("Joining the club...");
      if(contractPublic != undefined) {
        minimumToEnter = web3.utils.toWei(minimumToEnter,"ether");
        const query = contractPublic.methods.joinClub(clubId);
        const encodedABI = query.encodeABI();
        const gasPrice = web3.utils.toHex(await web3.eth.getGasPrice());
        var clubId = await ethereum
              .request({
                method: 'eth_sendTransaction',
                params: [
                  {
                    from: account, 
                    to: investmentContractAddress,
                    data: encodedABI,
                    value: web3.utils.numberToHex(minimumToEnter),
                    gasLimit: '0x5208', // Customizable by the user during MetaMask confirmation.
                    maxPriorityFeePerGas: gasPrice, // Customizable by the user during MetaMask confirmation.
                    //maxFeePerGas: gasPrice, // Customizable by the user during MetaMask confirmation.
                  },
                ],
              });

          await sleep(milisecondsToWait);
  
          var clubCreated = await web3.eth.getTransactionReceipt(clubId);
          if(clubCreated == null) {
            $('.successJoinLeaveClub').css("display","none");
            $('.errorJoinLeaveClub').css("display","block");
            $('.errorJoinLeaveClub').text("Error joining the club");
            return;
          }
        }
    }
    $('.errorJoinLeaveClub').css('display','none');
    $('.successJoinLeaveClub').css("display","block");
    $('.successJoinLeaveClub').text("You have joined the club successfully");
    location.reload();
}

async function leaveClub() {
  await loginWithMetamask();
  await getContract(account);
  $('.successJoinLeaveClub').css('display','none');
  $('.errorJoinLeaveClub').css('display','none');
  var clubId = localStorage.getItem("clubId");
  
    if(clubId != null) {
      $('.successJoinLeaveClub').css("display","block");
      $('.successJoinLeaveClub').text("Leaving the club...");
      if(contractPublic != undefined) {
        
        const query = contractPublic.methods.leaveClub(clubId);
        const encodedABI = query.encodeABI();
        const gasPrice = web3.utils.toHex(await web3.eth.getGasPrice());
        var clubId = await ethereum
              .request({
                method: 'eth_sendTransaction',
                params: [
                  {
                    from: account, 
                    to: investmentContractAddress,
                    data: encodedABI,
                    gasLimit: '0x5208', // Customizable by the user during MetaMask confirmation.
                    maxPriorityFeePerGas: gasPrice, // Customizable by the user during MetaMask confirmation.
                    //maxFeePerGas: gasPrice, // Customizable by the user during MetaMask confirmation.
                  },
                ],
              });

          await sleep(milisecondsToWait);

          var clubCreated = await web3.eth.getTransactionReceipt(clubId);
          if(clubCreated == null) {
            $('.successJoinLeaveClub').css("display","none");
            $('.errorJoinLeaveClub').css("display","block");
            $('.errorJoinLeaveClub').text("Error leaving the club");
            return;
          }
        }
      }
    $('.errorJoinLeaveClub').css('display','none');
    $('.successJoinLeaveClub').css("display","block");
    $('.successJoinLeaveClub').text("You have left the club successfully");
    location.reload();
  
}

async function contributeClub() {
  await loginWithMetamask();
  await getContract(account);
  $('.successContributeClub').css('display','none');
  $('.errorContributeClub').css('display','none');
  var clubId = localStorage.getItem("clubId");
  var amountAE = $('#aeAmount').val();
  if(amountAE == '' || amountAE <= 0) {
    $('.successContributeClub').css('display','none');
    $('.errorContributeClub').css("display","block");
    $('.errorContributeClub').text("Amount must be more than 0.");
    return;
  }
    if(clubId != null) {
      $('.successContributeClub').css("display","block");
      $('.successContributeClub').text("Contributing to the club...");
      
      if(contractPublic != undefined) {
        amountAE = web3.utils.toWei(amountAE,"ether");
        try {
          const query = contractPublic.methods.contributeToClub(clubId);
          const encodedABI = query.encodeABI();
          const gasPrice = web3.utils.toHex(await web3.eth.getGasPrice());
          var clubId = await ethereum
              .request({
                method: 'eth_sendTransaction',
                params: [
                  {
                    from: account, 
                    to: investmentContractAddress,
                    data: encodedABI,
                    value: web3.utils.numberToHex(amountAE),
                    gasLimit: '0x5208', // Customizable by the user during MetaMask confirmation.
                    maxPriorityFeePerGas: gasPrice, // Customizable by the user during MetaMask confirmation.
                    //maxFeePerGas: gasPrice, // Customizable by the user during MetaMask confirmation.
                  },
                ],
              });
          await sleep(milisecondsToWait);

          var clubCreated = await web3.eth.getTransactionReceipt(clubId);
          if(clubCreated == null) {
            $('.errorContributeClub').css("display","none");
            $('.errorContributeClub').css("display","block");
            $('.errorContributeClub').text("Error with contribution to the club");
            return;
          }
        } catch(e) {
          $('.successContributeClub').css('display','none');
          $('.errorContributeClub').css("display","block");
          $('.errorContributeClub').text(e.toString());
          return;
        }
        
        
      }
    }
    $('.errorContributeClub').css('display','none');
    $('.successContributeClub').css("display","block");
    $('.successContributeClub').text("You have contributed to the club successfully");
    location.reload();
  
}

async function getMyClubs() {
  await loginWithMetamask();
  await getContract(account);
  if(contractPublic != undefined) {
    var clubs = await ethereum
        .request({
          method: 'eth_call',
          params: [
            {
              from: account, // The user's active address.
              data: contractPublic.methods.getMyClubs().encodeABI(),
              to: investmentContractAddress
            },
          ],
        });
    clubs = iface.decodeFunctionResult("getMyClubs", clubs);
    if(clubs.length > 0) {

      var list = document.querySelector('.my_clubs');
        var table = document.createElement('table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        var theadTr = document.createElement('tr');
        var balanceHeader = document.createElement('th');
        balanceHeader.innerHTML = 'ID';
        theadTr.appendChild(balanceHeader);
        var contractNameHeader = document.createElement('th');
        contractNameHeader.innerHTML = 'Name';
        theadTr.appendChild(contractNameHeader);
        var contractTickerHeader = document.createElement('th');
        contractTickerHeader.innerHTML = 'Members';
        theadTr.appendChild(contractTickerHeader);
        
        var usdHeader = document.createElement('th');
        usdHeader.innerHTML = 'Proposals';
        theadTr.appendChild(usdHeader);

        thead.appendChild(theadTr)

        table.className = 'table';
        table.appendChild(thead);

        clubs[0].forEach((valor) => {
          if(valor.clubId != 0) {
            var tbodyTr = document.createElement('tr');
        var contractTd = document.createElement('td');
        contractTd.innerHTML = "<a class='btn btn-success' onclick='changeClub(" + valor.clubId + ")''>"+valor.clubId+"</a>";
        tbodyTr.appendChild(contractTd);
        var contractTickerTd = document.createElement('td');
        contractTickerTd.innerHTML = '<b>' + valor.name + '</b>';
        tbodyTr.appendChild(contractTickerTd);
        var balanceTd = document.createElement('td');
        balanceTd.innerHTML = '<b>' + valor.memberCount + '</b>';
        tbodyTr.appendChild(balanceTd);
        var balanceUSDTd = document.createElement('td');
        balanceUSDTd.innerHTML = '<b>' + valor.proposalCount+ '</b>';
        tbodyTr.appendChild(balanceUSDTd);
        tbody.appendChild(tbodyTr);
          }
        
      });

      table.appendChild(tbody);

        list.appendChild(table);
    }
    $('.loading_message').css('display','none');
  }
}

async function addComment() {
  await loginWithMetamask();
  await getContract(account);

  var newComment = $('#newcomment').val();

  if(newComment != '') {
    if(contractPublic != undefined) {
      var clubId = localStorage.getItem("clubId");
      var proposalId = localStorage.getItem("proposalId");
      try {
        const query = contractPublic.methods.addComment(proposalId, clubId, newComment);
        const encodedABI = query.encodeABI();
        const gasPrice = web3.utils.toHex(await web3.eth.getGasPrice());
        var txId = await ethereum
          .request({
            method: 'eth_sendTransaction',
            params: [
              {
                from: account, 
                to: investmentContractAddress,
                data: encodedABI,
                gasLimit: '0x5208', // Customizable by the user during MetaMask confirmation.
                maxPriorityFeePerGas: gasPrice, // Customizable by the user during MetaMask confirmation.
                //maxFeePerGas: gasPrice, // Customizable by the user during MetaMask confirmation.
              },
            ],
          });
        await sleep(milisecondsToWait);
        var commentCreated = await web3.eth.getTransactionReceipt(txId);
        if(commentCreated == null) {
          $('.errorCommentProposal').css("display","none");
          $('.errorCommentProposal').css("display","block");
          $('.errorCommentProposal').text("Error adding the comment");
          return;
        }
        $('.errorCommentProposal').css('display','none');
        $('.successCommentProposal').css("display","block");
        $('.successCommentProposal').text("You have commented to this proposal successfully");
        $('#newcomment').val('');
        await getCommentsByProposal();
      } 
      catch (error) {
        $('.successCommentProposal').css('display','none');
        $('.errorCommentProposal').css("display","block");
        $('.errorCommentProposal').text(e.toString());
        return;
      }
    }
  }
}


async function checkBalance()
{
  await loginWithMetamask();
  try {
    var balance = await web3.eth.getBalance(account);
    var balanceFil = web3.utils.fromWei(balance,"ether");
      $('.view_balance_address').text(balanceFil);
  } catch { }
}

$(function()
{

  $('#btnAuth').click(
    function() {
      autenticate()});

    $('#btnLeaveClub').click(
      function() {
        leaveClub()});

    $('#btnContributeClub').click(
      function() {
        contributeClub()});

    $('#createClubButton').click(
      function() {
        createClub()});    

    $('#btnJoinClub').click(
      function() {
        joinClub()});
    $('#createProposalButton').click(
      function() {
        createProposal()});

    $('#btnVote').click(
      function() {
        voteOnProposal()});

    $('#btnExecution').click(
      function() {
        runProposal()});
        
    $('#btnAddComment').click(
      function() {
        addComment();
      }
    )
    
}
    
);
