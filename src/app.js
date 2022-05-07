App = {
  loading: false,
  contracts: {},
  address: undefined,
  recentlyVoted: new Map(),
  map1: new Map(),
  proposalMap: new Map(),
    load: async () => {
      await App.loadWeb3()
        console.log("app loading...");
        await App.loadAccount()
        console.log("account loaded");
        await App.loadContract()
        console.log("contract loaded")
        await App.render()
        console.log("rendered");
        var intervalId = window.setInterval(function(){
        //  App.renderVotes();
        }, 5000);
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
    console.log("fails rendertasks")
    await App.renderTasks()
    App.setLoading(false)

  },

  createProp: async() =>{
    var title = document.getElementById("prop-title").value;
    var content = document.getElementById("prop-content").value;
    const now = new Date()  
    const milliseccondsSinceEpoch = now.getTime() + (now.getTimezoneOffset() * 60 * 1000) ;
    await App.Ballot.createProposal(title,content,milliseccondsSinceEpoch) 
    console.log(title + content);
  },

  renderVotes: async() =>{ 
    proposalCount = await App.Ballot.proposalCount();
    for (var i = 1; i <= proposalCount; i++) {
      if(App.recentlyVoted.get(i) != true){
      // Fetch the task data from the blockchain
      const task = await App.Ballot.proposals(i)
      var test1 = document.getElementsByClassName("vote-arrows-" + i);
      document.getElementsByClassName("vote-arrows-" + i)[0].getElementsByClassName("upvote-label")[0].innerText = task[1];
      document.getElementsByClassName("vote-arrows-" + i)[0].getElementsByClassName("downvote-label")[0].innerText = task[2];
      var currentVote = await App.Ballot.voters(App.address,i);
      if(currentVote.toNumber() == 1) {
        document.getElementById(i + '-up').classList.add("on");
          document.getElementById(i + '-down').classList.remove("on");
      }
      else if(currentVote.toNumber() == -1){
        document.getElementById(i + '-down').classList.add("on");
        document.getElementById(i + '-up').classList.remove("on");
      }
    }
   }
  },
  renderTasks: async () => {
    // Load the total task count from the blockchain
    const proposalCount = await App.Ballot.proposalCount()
    console.log("propcount loaded")
    const map1 = new Map();

    for(var i = 1; i <= proposalCount; i++){
      const proposal = await App.Ballot.proposals(i);
      const propHash = proposal[5];
      console.log(propHash)
      App.proposalMap.set(propHash,proposal);
    }
    const transition = new Map([...App.proposalMap.entries()].sort((a, b) => -a[1][1].toNumber() + b[1][1].toNumber()));
    console.log(...App.proposalMap.entries())
    App.proposalMap = transition;
    console.log(...App.proposalMap.entries())
    console.log(App.proposalMap.entries())
    // Render out each task with a new task template
    console.log("print upvotes")
    for (const [key, value] of App.proposalMap.entries()) {
      console.log(value[1].toNumber());
    }
    for (const [key, value] of App.proposalMap.entries()) {
          // Fetch the task data from the blockchain
          const propId = value[0];
      const numUpvotes = value[1].toNumber();
      const numDownvotes = value[2].toNumber();
      const title = value[3]
      console.log(title);
      const content = value[4]
      const hash = key;

      // Create the html for the task
      let html_string = '<div id = test-id style = "position:relative; left:80px; top:200px; "> <div class="card"><div class="proposal-header"> Card header </div> <div class="proposal-content p-2"> Card with header and footer... </div> <div class = "vote-arrows-id"> <span id = "xx" class="sprite vote-up"> </span><label class = "upvote-label"> yuh </label> <label class = "downvote-label"> yuh2 </label>  <span id = "xx" span class="sprite vote-down"> </span> </div> <br> <br> </div> </div>'

        var template = document.createElement('template');
        html_string = html_string.trim().replace('test-id', 'test-' + hash).replace('span id = "xx"','span id = ' + hash + '-up').replace('span id = "xx"','span id = ' + hash + '-down').replace("vote-arrows-id","vote-arrows-"+hash); 
        var currentVote = await App.Ballot.voters(App.address,propId);
        console.log(currentVote.toNumber());
        template.innerHTML = html_string;
        template.content.firstChild.getElementsByClassName("proposal-header")[0].innerText = title;
        template.content.firstChild.getElementsByClassName("proposal-content")[0].innerText = content;
        template.content.firstChild.getElementsByClassName("upvote-label")[0].innerText = numUpvotes;
        template.content.firstChild.getElementsByClassName("downvote-label")[0].innerText = numDownvotes;
        map1.set(hash,template.content.firstChild);
        document.body.appendChild(template.content.firstChild);
        if(currentVote.toNumber() == 1) {
          document.getElementById(hash + '-up').classList.add("on");
        }
        else if(currentVote.toNumber() == -1){
          document.getElementById(hash + '-down').classList.add("on");
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
      console.log(event.currentTarget.id);
      btn.hash = btn.id.substring(0, btn.id.length - 3);
      console.log(btn.hash)
      var newChild = map1.get(btn.hash);
      console.log(newChild)
      let other_id = event.currentTarget.id.split("-")[0] + '-down';
      var upvoteOn = event.currentTarget.classList.contains('on');
      var downvoteOn = document.getElementById(other_id).classList.contains('on');
      if(!upvoteOn && !downvoteOn){
        console.log(newChild.getElementsByClassName("upvote-label")[0].innerText)
        newChild.getElementsByClassName("upvote-label")[0].innerText = parseInt(newChild.getElementsByClassName("upvote-label")[0].innerText)+1;
        newChild.getElementsByClassName("downvote-label")[0].innerText = parseInt(newChild.getElementsByClassName("downvote-label")[0].innerText);
      }else if(upvoteOn && !downvoteOn){
        newChild.getElementsByClassName("upvote-label")[0].innerText = parseInt(newChild.getElementsByClassName("upvote-label")[0].innerText)-1;
        newChild.getElementsByClassName("downvote-label")[0].innerText = parseInt(newChild.getElementsByClassName("downvote-label")[0].innerText);
      }else if(!upvoteOn && downvoteOn){
        newChild.getElementsByClassName("upvote-label")[0].innerText = parseInt(newChild.getElementsByClassName("upvote-label")[0].innerText)+1;
        newChild.getElementsByClassName("downvote-label")[0].innerText = parseInt(newChild.getElementsByClassName("downvote-label")[0].innerText)-1;
      }
      
      document.body.replaceChild(newChild,map1.get((btn.hash)));
      map1.set((btn.hash),newChild);
      //console.log(btn.className.substring(5));
      console.log(event.currentTarget.classList);
      event.currentTarget.classList.toggle('on');
      App.recentlyVoted.set((btn.hash),true);
      if (event.currentTarget.id.includes('up')) {
         other_id = event.currentTarget.id.split("-")[0] + '-down';
        document.getElementById(other_id).classList.remove("on");
      }
      else {
         other_id = event.currentTarget.id.split("-")[0] + '-up'
        document.getElementById(other_id).classList.remove("on");
      }
     
      await App.Ballot.proposalUpvoted(App.proposalMap.get(btn.hash)[0],App.address);
      App.recentlyVoted.set((btn.hash),false);
      const proposal = await App.Ballot.proposals(App.proposalMap.get(btn.hash)[0]);
     // await App.renderVotes();
      console.log("Upvotes: " + proposal[1]);
      console.log("Downvotes: " + proposal[2]);
      console.log("currentState: "+ await App.Ballot.voters(App.address,btn.hash));
    }

    async function downvote(btn,event){
      btn.hash = btn.id.substring(0, btn.id.length - 5);
      var newChild = map1.get((btn.hash));
      console.log((btn.hash));
      console.log(newChild);
      let other_id = event.currentTarget.id.split("-")[0] + '-up';
      var downvoteOn = event.currentTarget.classList.contains('on');
      var upvoteOn = document.getElementById(other_id).classList.contains('on');
      if(!upvoteOn && !downvoteOn){
        newChild.getElementsByClassName("upvote-label")[0].innerText = parseInt(newChild.getElementsByClassName("upvote-label")[0].innerText);
        newChild.getElementsByClassName("downvote-label")[0].innerText = parseInt(newChild.getElementsByClassName("downvote-label")[0].innerText)+1;
      }else if(upvoteOn && !downvoteOn){
        newChild.getElementsByClassName("upvote-label")[0].innerText = parseInt(newChild.getElementsByClassName("upvote-label")[0].innerText)-1;
        newChild.getElementsByClassName("downvote-label")[0].innerText = parseInt(newChild.getElementsByClassName("downvote-label")[0].innerText)+1;
      }else if(!upvoteOn && downvoteOn){
        newChild.getElementsByClassName("upvote-label")[0].innerText = parseInt(newChild.getElementsByClassName("upvote-label")[0].innerText);
        newChild.getElementsByClassName("downvote-label")[0].innerText = parseInt(newChild.getElementsByClassName("downvote-label")[0].innerText)-1;
      }
      App.recentlyVoted.set((btn.hash),true);
      document.body.replaceChild(newChild,map1.get((btn.hash)));
      map1.set((btn.hash),newChild);

      event.currentTarget.classList.toggle('on');
   //   console.log(event.currentTarget.id);

      if (event.currentTarget.id.includes('up')) {
         other_id = event.currentTarget.id.split("-")[0] + '-down';
        document.getElementById(other_id).classList.remove("on");
      }
      else {
         other_id = event.currentTarget.id.split("-")[0] + '-up'
        document.getElementById(other_id).classList.remove("on");
      }
      console.log(btn.id)
      
      //console.log(btn.className.substring(5));
      await App.Ballot.proposalDownvoted(App.proposalMap.get(btn.hash)[0],App.address);
      App.recentlyVoted.set((btn.hash),false);
      const proposal = await App.Ballot.proposals(App.proposalMap.get(btn.hash)[0]);
      console.log(proposal);
      console.log("Upvotes: " + proposal[1]);
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
