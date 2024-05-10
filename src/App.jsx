import { useEffect, useState } from 'react'
import { Skeleton, ImageList, ImageListItem, Box, Container, AppBar, Toolbar, Card, CardContent, Typography, CardActions, Button, CardMedia, IconButton } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import VideocamIcon from '@mui/icons-material/Videocam'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import {
  StreamCall, StreamVideo, StreamVideoClient, StreamTheme, ParticipantView, useCall, useCallStateHooks, SfuModels
} from '@stream-io/video-react-sdk'
import '@stream-io/video-react-sdk/dist/css/styles.css'


const callId = '5hzvT4XyCzjB'
const userId = '4-LOM'
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
    <div style={{ position: 'fixed', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <AppBar color='darkerBackground' enableColorOnDark sx={{ position: 'relative' }}>
        <Toolbar variant='dense'>
          <Button onClick={() => window.open('https://github.com/pangrr/meet', '_blank')} startIcon={<GitHubIcon />} color='inherit'>source code</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: '1rem', overflow: 'scroll' }}>
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <StreamTheme>
              <SpeakerView />
              <Controls />
            </StreamTheme>
          </StreamCall>
        </StreamVideo>
      </Box>
    </div>
  )
}

function SpeakerView() {
  const call = useCall()
  const { useParticipants } = useCallStateHooks()
  const [participantInSpotlight, ...otherParticipants] = useParticipants()

  return (
    <div>
      {call && otherParticipants.length > 0 && (
        <div style={{}}>
          {otherParticipants.map((participant) => (
            <div key={participant.sessionId}>
              <ParticipantView participant={participant} />
            </div>
          ))}
        </div>
      )}

      <div>
        {call && participantInSpotlight && (
          <ParticipantView
            participant={participantInSpotlight}
            trackType={
              hasScreenShare(participantInSpotlight)
                ? 'screenShareTrack'
                : 'videoTrack'
            }
          />
        )}
      </div>
    </div>
  )
}

function hasScreenShare(participant) {
  participant.publishedTracks.includes(SfuModels.TrackType.SCREEN_SHARE);
}

function Controls({ onLeave }) {
  return (
    <div className="str-video__call-controls">
      <ToggleCamButton />
      <ToggleMicButton />
      <HangupButton onLeave={onLeave} />
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
};



export default App
