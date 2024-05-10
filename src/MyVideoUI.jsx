import { useCallStateHooks, ParticipantView } from '@stream-io/video-react-sdk'

export function MyVideoUI() {
	const { useParticipants } = useCallStateHooks();
	const participants = useParticipants();
	return (
		<>
			{participants.map((p) => (
				<ParticipantView participant={p} key={p.sessionId} />
			))}
		</>
	)
}

export function MyVideoButton() {
	const { useCameraState } = useCallStateHooks();
	const { camera, isMute } = useCameraState();
	return (
		<button onClick={() => camera.toggle()}>
			{isMute ? 'Turn on camera' : 'Turn off camera'}
		</button>
	)
}

export function MyMicrophoneButton() {
	const { useMicrophoneState } = useCallStateHooks();
	const { microphone, isMute } = useMicrophoneState();
	return (
		<button onClick={() => microphone.toggle()}>
			{isMute ? 'Turn on microphone' : 'Turn off microphone'}
		</button>
	)
}
