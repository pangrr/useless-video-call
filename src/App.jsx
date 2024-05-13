import { useEffect, useState, forwardRef } from 'react'
import { Skeleton, ImageList, ImageListItem, Box, Container, Stack, AppBar, Toolbar, Card, CardContent, Typography, CardActions, Button, CardMedia, IconButton } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import VideocamIcon from '@mui/icons-material/Videocam'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import {
  StreamCall, StreamVideo, StreamVideoClient, StreamTheme, ParticipantView, useCall, useCallStateHooks, SfuModels, SpeakerLayout, DefaultParticipantViewUI, useParticipantViewContext
} from '@stream-io/video-react-sdk'
import '@stream-io/video-react-sdk/dist/css/styles.css'
import './App.css'

const callId = '5hzvT4XyCzjB'
const userId = "Ran"
const user = { id: userId }
const apiKey = 'mmhfdzb5evj2'
const tokenProvider = async () => {
  const res = await fetch('https://pronto.getstream.io/api/auth/create-token?' +
    new URLSearchParams({
      api_key: apiKey,
      user_id: userId
    })
  )
  const { token } = await res.json()
  return token
}

function App() {
  const [client, setClient] = useState()
  const [call, setCall] = useState()

  useEffect(() => {
    const _client = new StreamVideoClient({ apiKey, user, tokenProvider })
    setClient(_client)
    return () => {
      if (!client) return
      client.disconnectUser()
      setClient(undefined)
    }
  }, [])

  useEffect(() => {
    async function startCall() {
      if (!client) return

      const _call = client.call('default', callId)
      await _call.camera.disable()
      await _call.microphone.disable()
      await _call.join({ create: true }).catch((e) => console.error(`Failed to join the call`, e))

      setCall(_call)
    }

    startCall()

    return () => {
      if (!call) return
      call.leave().catch((err) => console.error(`Failed to leave the call`, err))
      setCall(undefined)
    }
  }, [client])


  if (!client || !call) return null

  return (
    <div style={{ position: 'fixed', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <AppBar color='darkerBackground' enableColorOnDark sx={{ position: 'relative' }}>
        <Toolbar variant='dense'>
          <Button onClick={() => window.open('https://github.com/pangrr/meet', '_blank')} startIcon={<GitHubIcon />} color='inherit'>source code</Button>
        </Toolbar>
      </AppBar>
      <StreamTheme style={{ width: '100%', height: '100%', }}>
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <CallView />
          </StreamCall>
        </StreamVideo>
      </StreamTheme>
    </div>
  )
}

function CallView() {
  const call = useCall()
  const { useParticipants } = useCallStateHooks()
  const [participantInSpotlight, ...otherParticipants] = useParticipants()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {call && otherParticipants.length > 0 && (
        <div className='participantsBar' style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '160px', overflowX: 'scroll', scrollbarWidth: 'none' }}>
          {otherParticipants.map((participant) => (
            <div style={{ width: '240px' }} key={participant.sessionId}>
              <ParticipantView
                participant={participant}
                ParticipantViewUI={null}
                className='otherParticipantView'
              />
            </div>
          ))}
        </div>
      )}
      <div className='spotlight' style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '0' }}>
        {call && participantInSpotlight && (
          <ParticipantView
            participant={participantInSpotlight}
            ParticipantViewUI={null}
          />
        )}
      </div>
      <Controls />
    </div>
  )
}


function Controls({ onLeave }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '1.5rem' }}>
      <ToggleCamButton />
      <ToggleMicButton />
      {/* <HangupButton onLeave={onLeave} /> */}
    </div>
  )
}

function HangupButton({ reject }) {
  const call = useCall()
  return (
    <IconButton color='error' onClick={() => call?.leave({ reject })}>
      <CallEndIcon />
    </IconButton>
  )
}

function ToggleMicButton() {
  const { useMicrophoneState } = useCallStateHooks()
  const { microphone, isMute } = useMicrophoneState()
  return (
    <IconButton onClick={() => microphone.toggle()} color={isMute ? 'error' : 'primary'}>
      {isMute ? (
        <MicOffIcon />
      ) : (
        <MicIcon />
      )}
    </IconButton>
  )
}

function ToggleCamButton() {
  const { useCameraState } = useCallStateHooks();
  const { camera, isMute } = useCameraState();
  return (
    <IconButton onClick={() => camera.toggle()} color={isMute ? 'error' : 'primary'}>
      {isMute ? (
        <VideocamOffIcon />
      ) : (
        <VideocamIcon />
      )}
    </IconButton>
  );
}

const VideoPlaceholder = forwardRef(function ({ participant, style }, ref) {
  return (
    <div style={{ ...style, width: '100%', height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', fontWeight: 'bold' }} ref={ref}>
      {participant.userId}
    </div>
  )
})

function ParticipantViewUI() {
  const { participant } = useParticipantViewContext()
  const { publishedTracks } = participant

  const hasAudio = publishedTracks.includes(SfuModels.TrackType.AUDIO)
  const hasVideo = publishedTracks.includes(SfuModels.TrackType.VIDEO)

  return (
    <div style={{ position: 'absolute', left: '0', bottom: '0' }}>
      {!hasAudio && (
        <MicOffIcon fontSize='small' />
      )}
      {!hasVideo && (
        <VideocamOffIcon fontSize='small' />
      )}
    </div>
  )
}



export default App
