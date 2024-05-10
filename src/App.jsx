import { useEffect, useState } from 'react'
import { Skeleton, ImageList, ImageListItem, Box, Container, AppBar, Toolbar, Card, CardContent, Typography, CardActions, Button, CardMedia, Collapse } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import { StreamCall, StreamVideo, StreamVideoClient, StreamTheme, SpeakerLayout, CallControls } from '@stream-io/video-react-sdk'
import { MyVideoUI } from './MyVideoUI'
import '@stream-io/video-react-sdk/dist/css/styles.css'

// NOTE: This will generate a new call on every reload
// Fork this CodeSandbox and set your own CallID if
// you want to test with multiple users or multiple tabs opened
const callId = '5hzvT4XyCzjB'
const user_id = '4-LOM'
const user = { id: user_id }

const apiKey = 'mmhfdzb5evj2'
const tokenProvider = async () => {
  const { token } = await fetch(
    'https://pronto.getstream.io/api/auth/create-token?' +
    new URLSearchParams({
      api_key: apiKey,
      user_id: user_id
    })
  ).then((res) => res.json())
  return token
}

function App() {
  const [client, setClient] = useState()
  const [call, setCall] = useState()

  useEffect(() => {
    const myClient = new StreamVideoClient({ apiKey, user, tokenProvider })
    setClient(myClient)
    return () => {
      myClient.disconnectUser()
      setClient(undefined)
    }
  }, [])

  useEffect(() => {
    if (!client) return
    const myCall = client.call('default', callId)
    myCall.join({ create: true }).catch((err) => {
      console.error(`Failed to join the call`, err)
    })

    setCall(myCall)

    return () => {
      setCall(undefined);
      myCall.leave().catch((err) => {
        console.error(`Failed to leave the call`, err)
      })
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
