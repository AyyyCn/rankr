import React, { useEffect } from 'react';
import { actions } from '../State';

export const WaitingRoom: React.FC = () => {
  useEffect(() => {
    console.log('Waiting room useEffect');
    actions.initializeSocket();
  }, []);
  return (
    <>
    <div className="flex flex-col w-full justify-between items-center h-full">
      <div>
        <h2 className="text-center">Poll Topic</h2>
        <p className="italic text-center mb-4">{currentState.poll?.topic}</p>
        <h2 className="text-center">Poll ID</h2>
        <h3 className="text-center mb-2">Click to copy!</h3>
        <div
          onClick={() => copyToClipboard(currentState.poll?.id || '')}
          className="mb-4 flex justify-center align-middle cursor-pointer"
        >
          <div className="font-extrabold text-center mr-2">
            {currentState.poll && colorizeText(currentState.poll?.id)}
          </div>
          <MdContentCopy size={24} />
        </div>
      </div>
      <div className="flex justify-center">
        <button
          className="box btn-orange mx-2 pulsate"
          onClick={() => setIsParticipantListOpen(true)}
        >
          <MdPeopleOutline size={24} />
          <span>{currentState.participantCount}</span>
        </button>
        <button
          className="box btn-purple mx-2 pulsate"
          onClick={() => setIsNominationFormOpen(true)}
        >
          <BsPencilSquare size={24} />
          <span>{currentState.nominationCount}</span>
        </button>
      </div>
      <div className="flex flex-col justify-center">
        {currentState.isAdmin ? (
          <>
            <div className="my-2 italic">
              {currentState.poll?.votesPerVoter} Nominations Required to
              Start!
            </div>
            <button
              className="box btn-orange my-2"
              disabled={!currentState.canStartVote}
              onClick={() => console.log('will add start vote next time!')}
            >
              Start Voting
            </button>
          </>
        ) : (
          <div className="my-2 italic">
            Waiting for Admin,{' '}
            <span className="font-semibold">
              {currentState.poll?.participants[currentState.poll?.adminID]}
            </span>
            , to start the voting.
          </div>
        )}
        <button
          className="box btn-purple my-2"
          onClick={() => setShowConfirmation(true)}
        >
          Leave Poll
        </button>
        <ConfirmationDialog
          message="You'll be kicked out of the poll"
          showDialog={showConfirmation}
          onCancel={() => setShowConfirmation(false)}
          onConfirm={() => actions.startOver()}
        />
      </div>
    </div>
    <ParticipantList
      isOpen={isParticipantListOpen}
      onClose={() => setIsParticipantListOpen(false)}
      participants={currentState.poll?.participants}
      onRemoveParticipant={confirmRemoveParticipant}
      isAdmin={currentState.isAdmin || false}
      userID={currentState.me?.id}
    />
    <NominationForm
      title={currentState.poll?.topic}
      isOpen={isNominationFormOpen}
      onClose={() => setIsNominationFormOpen(false)}
      onSubmitNomination={(nominationText) =>
        actions.nominate(nominationText)
      }
      nominations={currentState.poll?.nominations}
      userID={currentState.me?.id}
      onRemoveNomination={(nominationID) =>
        actions.removeNomination(nominationID)
      }
      isAdmin={currentState.isAdmin || false}
    />
    <ConfirmationDialog
      showDialog={isConfirmationOpen}
      message={confirmationMessage}
      onConfirm={() => submitRemoveParticipant()}
      onCancel={() => setIsConfirmationOpen(false)}
    />
  </>
  );
};