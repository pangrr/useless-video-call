import { useEffect, useState, forwardRef } from 'react'
import { Stack, AppBar, Toolbar, Button, TextField, IconButton } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import VideocamIcon from '@mui/icons-material/Videocam'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import {
  StreamCall, StreamVideo, StreamVideoClient, StreamTheme, ParticipantView, useCall, useCallStateHooks, SfuModels, useParticipantViewContext
} from '@stream-io/video-react-sdk'
import '@stream-io/video-react-sdk/dist/css/styles.css'
import './App.css'

const callId = '5hzvT4XyCzjB'
const apiKey = 'mmhfdzb5evj2'

function App() {
  const [client, setClient] = useState()
  const [call, setCall] = useState()
  const [userId, setUserId] = useState('')

  useEffect(() => hangup, [])

  return (
    <div style={{ position: 'fixed', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <AppBar color='darkerBackground' enableColorOnDark sx={{ position: 'relative' }}>
        <Toolbar variant='dense'>
          <Button onClick={() => window.open('https://github.com/pangrr/call', '_blank')} startIcon={<GitHubIcon />} color='inherit'>source code</Button>
        </Toolbar>
      </AppBar>
      {call ?
        <StreamTheme style={{ width: '100%', height: '100%' }}>
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <CallView />
                <Controls onHangup={hangup} />
              </div>
            </StreamCall>
          </StreamVideo>
        </StreamTheme>
        :
        <Stack style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
          <TextField value={userId} onChange={(e) => setUserId(e.target.value)} style={{ width: '10rem' }} label='Your Name' name='userId' variant='outlined' />
          <Button disabled={!userId} onClick={startCall} variant='contained' style={{ width: '10rem' }}>start call</Button>
        </Stack>
      }
    </div>
  )

  async function startCall() {
    const user = { id: userId }
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
    const _client = new StreamVideoClient({ apiKey, user, tokenProvider })
    setClient(_client)

    const _call = _client.call('default', callId)
    await _call.camera.disable()
    await _call.microphone.disable()
    await _call.join({ create: true }).catch((e) => console.error(`Failed to join the call`, e))
    setCall(_call)
  }

  function hangup() {
    if (call) {
      call.leave().catch((err) => console.error(`Failed to leave the call`, err))
      setCall(undefined)
    }
    if (client) {
      client.disconnectUser()
      setClient(undefined)
    }
  }
}


function CallView() {
  const call = useCall()
  const { useParticipants } = useCallStateHooks()
  const [participantInSpotlight, ...otherParticipants] = useParticipants()

  return (
    <>
      {call && otherParticipants.length > 0 && (
        <div className='participantsBar' style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '180px', padding: '10px', overflowX: 'scroll', scrollbarWidth: 'none' }}>
          {otherParticipants.map((participant) => (
            <div style={{ width: '240px', height: '100%' }} key={participant.sessionId}>
              <ParticipantView
                participant={participant}
                ParticipantViewUI={ParticipantViewUI}
                className='otherParticipantView'
                VideoPlaceholder={VideoPlaceholder}
              />
            </div>
          ))}
        </div>
      )}
      <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '0' }}>
        {call && participantInSpotlight && (
          <ParticipantView
            participant={participantInSpotlight}
            ParticipantViewUI={ParticipantViewUI}
            VideoPlaceholder={VideoPlaceholder}
          />
        )}
      </div>
    </ >
  )
}


function Controls({ onHangup }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '1.5rem' }}>
      <ToggleCamButton />
      <ToggleMicButton />
      <HangupButton onHangup={onHangup} />
    </div>
  )
}

function HangupButton({ onHangup }) {
  return (
    <IconButton color='error' onClick={onHangup}>
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
  const name = participant.name || participant.userId
  const initials = name.split(' ').slice(0, 2).map((n) => n[0]).join('')
  return (
    <div style={{ ...style, background: 'var(--str-video__background-color5)', borderRadius: 'inherit', aspectRatio: '4 / 3', height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', }} ref={ref}>
      <div style={{ background: 'var(--str-video__primary-color)', borderRadius: 'var(--str-video__border-radius-circle)', fontSize: '32px', fontWeight: '600', textTransform: 'uppercase', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100px', height: '100px', }}>
        {initials}
      </div>
    </div>
  )
})

function ParticipantViewUI() {
  const { participant } = useParticipantViewContext()
  const { publishedTracks, name, userId } = participant

  const hasAudio = publishedTracks.includes(SfuModels.TrackType.AUDIO)
  const hasVideo = publishedTracks.includes(SfuModels.TrackType.VIDEO)

  return (
    <div style={{
      position: 'absolute',
      left: '0',
      bottom: '0',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--str-video__spacing-sm)',
      borderRadius: '0 var(--str-video__border-radius-xs) 0 var(--str-video__border-radius-sm)',
      backgroundColor: 'var(--str-video__background-color4)',
      fontSize: 'var(--str-video__font-size-sm)',
      padding: '4px 6px'
    }}>
      <span>{name || userId}</span>
      {!hasAudio && (
        <MicOffIcon style={{ fontSize: '1rem' }} />
      )}
      {!hasVideo && (
        <VideocamOffIcon style={{ fontSize: '1rem' }} />
      )}
    </div>
  )
}



export default App
