App = {
  loading: false,
  contracts: {},
  address: undefined,
    load: async () => {
      await App.loadWeb3()
        console.log("app loading...");
        await App.loadAccount()
        await App.loadContract()
        await App.render()
    },

      // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async() => {
    web3.eth.defaultAccount=web3.eth.accounts[0] //seems to just use whatever is connected to metamask
    App.address = web3.eth.defaultAccount
    console.log(App.address)
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const Ballot = await $.getJSON('Ballot.json')
    App.contracts.Ballot = TruffleContract(Ballot)
    App.contracts.Ballot.setProvider(App.web3Provider)

    App.Ballot = await App.contracts.Ballot.deployed()
  },

  render: async() => {
    //render account
    if(App.loading){
      return
    }

    App.setLoading(true)
    $('#account').html(App.account)
    await App.renderTasks()
    App.setLoading(false)

  },
  renderTasks: async () => {
    // Load the total task count from the blockchain
    const taskCount = await App.Ballot.proposalCount()
    const $taskTemplate = $('.card')
    const map1 = new Map();

    // Render out each task with a new task template
    for (var i = 1; i <= taskCount; i++) {
      // Fetch the task data from the blockchain
      const task = await App.Ballot.proposals(i)
      const taskId = task[0].toNumber()
      const taskTitle = task[3]
      const taskContent = task[4]

      // Create the html for the task
      let html_string = '<div id = test-id style = "position:relative; left:80px; top:200px; "> <div class="card"><div class="proposal-header"> Card header </div> <div class="proposal-content p-2"> Card with header and footer... </div> <div class = "vote-arrows-id"> <span id = "xx" class="sprite vote-up"> </span><label class = "upvote-label"> yuh </label> <label class = "downvote-label"> yuh2 </label>  <span id = "xx" span class="sprite vote-down"> </span> </div> <br> <br> </div> </div>'

        var template = document.createElement('template');
        html_string = html_string.trim().replace('test-id', 'test-' + i).replace('span id = "xx"','span id = ' + i + '-up').replace('span id = "xx"','span id = ' + i + '-down'); 
        var currentVote = await App.Ballot.voters(App.address,i);
        console.log(currentVote.toNumber());
        template.innerHTML = html_string;
        template.content.firstChild.getElementsByClassName("proposal-header")[0].innerText = taskTitle;
        template.content.firstChild.getElementsByClassName("proposal-content")[0].innerText = taskContent;
        template.content.firstChild.getElementsByClassName("upvote-label")[0].innerText = task[1];
        template.content.firstChild.getElementsByClassName("downvote-label")[0].innerText = task[2];
        map1.set(i,template.content.firstChild);
        document.body.appendChild(template.content.firstChild);
        if(currentVote.toNumber() == 1) {
          document.getElementById(i + '-up').classList.add("on");
        }
        else if(currentVote.toNumber() == -1){
          document.getElementById(i + '-down').classList.add("on");
        }
        
          
        //template.content.firstChild.getElementsByTagName("input")[0].check
     /* const $newTaskTemplate = $taskTemplate.clone()
      $newTaskTemplate.find('.content').html(taskContent)
      $newTaskTemplate.find('input')
                      .prop('name', taskId)
                      .prop('checked', taskCompleted)
                      .on('click', App.toggleCompleted)
*/
      // Put the task in the correct list
      /*if (taskCompleted) {
        $('#completedTaskList').append($newTaskTemplate)
      } else {
        $('#taskList').append($newTaskTemplate)
      }

      // Show the task
      $newTaskTemplate.show()
      */
    }
    for (const btn of document.querySelectorAll('.vote-up')) {
      btn.addEventListener('click', event => upvote(btn,event) );
    }

    async function upvote(btn,event){
      console.log(btn.id)
      console.log(event.currentTarget.id);
      var newChild = map1.get(parseInt(btn.id));
      //console.log(btn.className.substring(5));
      console.log(event.currentTarget.classList);
      event.currentTarget.classList.toggle('on');
      if (event.currentTarget.id.includes('up')) {
        let other_id = event.currentTarget.id.split("-")[0] + '-down';
        document.getElementById(other_id).classList.remove("on");
      }
      else {
        let other_id = event.currentTarget.id.split("-")[0] + '-up'
        document.getElementById(other_id).classList.remove("on");
      }
     
      await App.Ballot.proposalUpvoted(parseInt(btn.id),App.address);
      const proposal = await App.Ballot.proposals(parseInt(btn.id));
      console.log(proposal);
      newChild.getElementsByClassName("upvote-label")[0].innerText = proposal[1];
      newChild.getElementsByClassName("downvote-label")[0].innerText = proposal[2];
  
      document.body.replaceChild(newChild,map1.get(parseInt(btn.id)));
      map1.set(parseInt(btn.id),newChild);
      console.log("Upvotes: " + proposal[1]);
      console.log("Downvotes: " + proposal[2]);
      console.log("currentState: "+ await App.Ballot.voters(App.address,i));
    }

    async function downvote(btn,event){
      event.currentTarget.classList.toggle('on');
      console.log(event.currentTarget.id);

      if (event.currentTarget.id.includes('up')) {
        let other_id = event.currentTarget.id.split("-")[0] + '-down';
        document.getElementById(other_id).classList.remove("on");
      }
      else {
        let other_id = event.currentTarget.id.split("-")[0] + '-up'
        document.getElementById(other_id).classList.remove("on");
      }
      console.log(btn.id)
      var newChild = map1.get(parseInt(btn.id));
      //console.log(btn.className.substring(5));
      await App.Ballot.proposalDownvoted(parseInt(btn.id),App.address);
      const proposal = await App.Ballot.proposals(parseInt(btn.id));
      console.log(proposal);
      console.log("Upvotes: " + proposal[1]);
      newChild.getElementsByClassName("upvote-label")[0].innerText = proposal[1];
      newChild.getElementsByClassName("downvote-label")[0].innerText = proposal[2];
      document.body.replaceChild(newChild,map1.get(parseInt(btn.id)));
      map1.set(parseInt(btn.id),newChild);
      console.log("Downvotes: " + proposal[2]);
    }

    for (const btn of document.querySelectorAll('.vote-down')) {
      btn.addEventListener('click', event => downvote(btn,event)) 
    }
  },

  toggleCompleted: async (e) => {
    App.setLoading(true)
    const taskId = e.target.name
    await App.Ballot.toggleCompleted(taskId)
    window.location.reload()
  },
  
  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  },
  

}

$(() => {
    $(window).load(() => {
      App.load()
    })
  })
