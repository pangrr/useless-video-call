import { useEffect, useState } from 'react'
import { Skeleton, ImageList, ImageListItem, Box, Container, AppBar, Toolbar, Card, CardContent, Typography, CardActions, Button, CardMedia, Collapse } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import { StreamCall, StreamVideo, StreamVideoClient, StreamTheme, SpeakerLayout, CallControls } from '@stream-io/video-react-sdk'
import { MyVideoUI } from './MyVideoUI'
import '@stream-io/video-react-sdk/dist/css/styles.css'


const callId = '5hzvT4XyCzjB'
const user_id = '4-LOM'
const user = { id: user_id }
const apiKey = 'mmhfdzb5evj2'
const tokenProvider = async () => {
  const res = await fetch('https://pronto.getstream.io/api/auth/create-token?' +
    new URLSearchParams({
      api_key: apiKey,
      user_id: user_id
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
      _call.join({ create: true }).catch((e) => console.error(`Failed to join the call`, e))

      setCall(_call)
    }

    startCall()

    return () => {
      if (!call) return
      _call.leave().catch((err) => console.error(`Failed to leave the call`, err))
      setCall(undefined)
    }
  }, [client])

  if (!client || !call) return null

  return (
    <StreamVideo client={client}>
      <StreamTheme>
        <StreamCall call={call}>
          <SpeakerLayout />
          <CallControls />
        </StreamCall>
      </StreamTheme>
    </StreamVideo>
  );

  return (
    <>
      <AppBar color='darkerBackground' enableColorOnDark>
        <Toolbar variant='dense'>
          <Button onClick={() => window.open('https://github.com/pangrr/meet', '_blank')} startIcon={<GitHubIcon />} color='inherit'>source code</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth='xl'>
        <Box sx={{ pt: 6, maxHeight: '100%' }}>
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <MyVideoUI />
            </StreamCall>
          </StreamVideo>
        </Box>
      </Container>
    </>
  )

}

export default App
