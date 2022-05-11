pragma solidity ^0.5.0;

contract Ballot{
    int public proposalCount = 0;
    struct Voter {
        address x;
    }
    struct Proposal{
        int proposalID; 
        int numPos;
        int numNeg;
        string title;
        string content;
        string proposalHash;
    }
    mapping(int => Proposal) public proposals;
    mapping(address => bool) public voterAdded;
    mapping(address => mapping(int => int)) public voters; //address to voter's current vote

    event ProposalCreated(
        int proposalID,
        int numPos,
        int numNeg,
        string title,
        string content,
        string proposalHash
    );

    event VoterAdded(
        address x
    );

    event change(
        int numPos,
        int numNeg
    );
/*
    event ItemUpvoted(	
        int proposalID,	
        int currentVote
    );

    event ItemDownvoted(	
        int proposalID,	
        int currentVote
    );
*/


    function addVoter(address add) public{
        voterAdded[add] = true;
        emit VoterAdded(add);
        for(int i = 0; i < proposalCount; i++){
            voters[add][i] = 0;
        }
    }

    function createProposal(string memory _title, string memory _content, string memory _proposalHash) public{
        proposalCount++;
        proposals[proposalCount] = Proposal(proposalCount, 0,0,_title, _content,_proposalHash);
        emit ProposalCreated(proposalCount,0,0,_title,_content,_proposalHash);
    }

    function proposalUpvoted(int proposalID, address voterAddress) public{
        int currentVote = voters[voterAddress][proposalID];
        if(currentVote == 1){
            voters[voterAddress][proposalID] = 0;
            proposals[proposalID].numPos -= 1;
        }
        else if(currentVote == 0){
            voters[voterAddress][proposalID] = 1;
            proposals[proposalID].numPos += 1;
        }else if(currentVote == -1){
            voters[voterAddress][proposalID] = 1;
            proposals[proposalID].numPos += 1;
            proposals[proposalID].numNeg -= 1;
        }
        emit change(proposals[proposalID].numPos,proposals[proposalID].numNeg);
    }

    function proposalDownvoted(int proposalID, address voterAddress) public{
        int currentVote = voters[voterAddress][proposalID];
        if(currentVote == 1){
            voters[voterAddress][proposalID] = -1;
            proposals[proposalID].numPos -= 1;
            proposals[proposalID].numNeg += 1;
        }
        else if(currentVote == 0){
            voters[voterAddress][proposalID] = -1;
            proposals[proposalID].numNeg++;
        }else if(currentVote == -1){
            voters[voterAddress][proposalID] = 0;
            proposals[proposalID].numNeg--;
        }
        emit change(proposals[proposalID].numPos,proposals[proposalID].numNeg);
    }

}