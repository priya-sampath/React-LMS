import React, { useEffect, useRef } from 'react'
import { MeetingProvider, useMeeting, useParticipant } from '@videosdk.live/react-sdk'

const ParticipantTile = ({ participantId, isModerator }) => {
  const {
    webcamStream,
    micStream,
    webcamOn,
    micOn,
    isLocal,
    displayName,
    disableMic,
    disableWebcam,
    remove,
  } = useParticipant(participantId)

  const videoRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && webcamStream) {
      const mediaStream = new MediaStream()
      mediaStream.addTrack(webcamStream.track)
      videoRef.current.srcObject = mediaStream
      videoRef.current.play().catch(() => {})
    }
  }, [webcamStream])

  useEffect(() => {
    if (audioRef.current && micStream && !isLocal) {
      const mediaStream = new MediaStream()
      mediaStream.addTrack(micStream.track)
      audioRef.current.srcObject = mediaStream
      audioRef.current.play().catch(() => {})
    }
  }, [micStream, isLocal])

  return (
    <div className='relative bg-gray-900 rounded-lg overflow-hidden aspect-video'>
      {webcamOn ? (
        <video ref={videoRef} autoPlay playsInline muted={isLocal} className='w-full h-full object-cover' />
      ) : (
        <div className='w-full h-full flex items-center justify-center text-white text-sm'>
          {displayName || 'Participant'} (camera off)
        </div>
      )}
      {!isLocal && <audio ref={audioRef} autoPlay />}

      <div className='absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded'>
        {displayName || 'Participant'} {isLocal && '(You)'} {!micOn && '🔇'}
      </div>

      {isModerator && !isLocal && (
        <div className='absolute top-2 right-2 flex gap-1'>
          <button
            onClick={() => disableMic()}
            style={{ cursor: 'pointer' }}
            className='bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black/80'
            title='Mute this participant'
          >
            Mute
          </button>
          <button
            onClick={() => disableWebcam()}
            style={{ cursor: 'pointer' }}
            className='bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black/80'
            title="Turn off this participant's camera"
          >
            Cam Off
          </button>
          <button
            onClick={() => remove()}
            style={{ cursor: 'pointer' }}
            className='bg-red-600/80 text-white text-xs px-2 py-1 rounded hover:bg-red-600'
            title='Remove from class'
          >
            Remove
          </button>
        </div>
      )}
    </div>
  )
}

const MeetingRoom = ({ isModerator, onLeave, onRecordingStopped }) => {
  const [isRecording, setIsRecording] = React.useState(false)
  const [connectionError, setConnectionError] = React.useState('')

  const { participants, localParticipant, toggleMic, toggleWebcam, leave, startRecording, stopRecording, localMicOn, localWebcamOn } = useMeeting({
    onMeetingLeft: onLeave,
    onRecordingStateChanged: ({ status }) => {
      setIsRecording(status === 'RECORDING_STARTED')
      if (status === 'RECORDING_STOPPED' && onRecordingStopped) {
        onRecordingStopped()
      }
    },
    onError: (error) => {
      console.error('VideoSDK meeting error:', error)
      setConnectionError(error?.message || 'Could not connect to the video room. Check your camera/mic permissions and try again.')
    },
  })

  const participantIds = [
    ...(localParticipant ? [localParticipant.id] : []),
    ...Array.from(participants.keys()).filter((id) => id !== localParticipant?.id),
  ]

  return (
    <div className='flex flex-col h-full bg-gray-950 rounded-lg'>
      {isModerator && isRecording && (
        <div className='bg-red-600 text-white text-xs text-center py-1'>● Recording</div>
      )}

      {connectionError && (
        <div className='bg-red-600 text-white text-sm text-center py-2 px-4'>{connectionError}</div>
      )}

      {!connectionError && participantIds.length === 0 && (
        <div className='flex-1 flex items-center justify-center text-gray-400 text-sm'>
          Connecting to the video room...
        </div>
      )}

      <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 overflow-y-auto'>
        {participantIds.map((id) => (
          <ParticipantTile key={id} participantId={id} isModerator={isModerator} />
        ))}
      </div>

      <div className='flex justify-center gap-3 p-4 border-t border-gray-800'>
        <button
          onClick={() => toggleMic()}
          style={{ cursor: 'pointer' }}
          className={`px-4 py-2 rounded text-sm font-medium ${localMicOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'}`}
        >
          {localMicOn ? 'Mute Me' : 'Unmute Me'}
        </button>
        <button
          onClick={() => toggleWebcam()}
          style={{ cursor: 'pointer' }}
          className={`px-4 py-2 rounded text-sm font-medium ${localWebcamOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'}`}
        >
          {localWebcamOn ? 'Camera Off' : 'Camera On'}
        </button>
        {isModerator && (
          <button
            onClick={() => (isRecording ? stopRecording() : startRecording())}
            style={{ cursor: 'pointer' }}
            className={`px-4 py-2 rounded text-sm font-medium ${isRecording ? 'bg-red-600 text-white' : 'bg-gray-700 text-white'}`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        )}
        <button
          onClick={() => leave()}
          style={{ cursor: 'pointer' }}
          className='px-4 py-2 rounded text-sm font-medium bg-red-700 text-white hover:bg-red-800'
        >
          {isModerator ? 'End Class' : 'Leave'}
        </button>
      </div>
    </div>
  )
}

const VideoMeetingRoom = ({ meetingId, token, name, isModerator, onLeave, onRecordingStopped }) => {
  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: name || 'Participant',
      }}
      token={token}
      joinWithoutUserInteraction
    >
      <MeetingRoom isModerator={isModerator} onLeave={onLeave} onRecordingStopped={onRecordingStopped} />
    </MeetingProvider>
  )
}

export default VideoMeetingRoom