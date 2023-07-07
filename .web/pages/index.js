import { Fragment, useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import { connect, E, getAllLocalStorageItems, getRefValue, isTrue, preventDefault, processEvent, refs, set_val, uploadFiles } from "/utils/state"
import "focus-visible/dist/focus-visible"
import { Box, Button, Heading, HStack, Input, Progress, Text, Textarea, useColorMode, VStack } from "@chakra-ui/react"
import ReactDropzone from "react-dropzone"
import NextHead from "next/head"


export default function Component() {
  const [state, setState] = useState({"file_str": "favicon.ico", "is_hydrated": false, "is_uploading": 0, "events": [{"name": "state.hydrate"}], "files": []})
  const [result, setResult] = useState({"state": null, "events": [], "final": true, "processing": false})
  const [notConnected, setNotConnected] = useState(false)
  const router = useRouter()
  const socket = useRef(null)
  const { isReady } = router
  const { colorMode, toggleColorMode } = useColorMode()
  const focusRef = useRef();
  
  // Function to add new events to the event queue.
  const Event = (events, _e) => {
      preventDefault(_e);
      setState(state => ({
        ...state,
        events: [...state.events, ...events],
      }))
  }

  // Function to add new files to be uploaded.
  const File = files => setState(state => ({
    ...state,
    files,
  }))

  // Main event loop.
  useEffect(()=> {
    // Skip if the router is not ready.
    if (!isReady) {
      return;
    }

    // Initialize the websocket connection.
    if (!socket.current) {
      connect(socket, state, setState, result, setResult, router, ['websocket', 'polling'], setNotConnected)
    }

    // If we are not processing an event, process the next event.
    if (!result.processing) {
      processEvent(state, setState, result, setResult, router, socket.current)
    }

    // If there is a new result, update the state.
    if (result.state != null) {
      // Apply the new result to the state and the new events to the queue.
      setState(state => ({
        ...result.state,
        events: [...state.events, ...result.events],
      }))

      // Reset the result.
      setResult(result => ({
        state: null,
        events: [],
        final: true,
        processing: !result.final,
      }))

      // Process the next event.
      processEvent(state, setState, result, setResult, router, socket.current)
    }
  })

  // Set focus to the specified element.
  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  })

  // Route after the initial page hydration.
  useEffect(() => {
    const change_complete = () => Event([E('state.hydrate', {})])
    router.events.on('routeChangeComplete', change_complete)
    return () => {
      router.events.off('routeChangeComplete', change_complete)
    }
  }, [router])


  return (
  <Fragment><Fragment>
  <VStack>
  <ReactDropzone multiple={true} onDrop={e => File(e)}>
  {({ getRootProps, getInputProps }) => (
    <Box sx={{"border": "1px dotted black", "padding": "2em"}} {...getRootProps()}>
    <Input type="file" {...getInputProps()}/>
    <Button sx={{"height": "70px", "width": "200px", "color": "rgb(107,99,246)", "bg": "white", "border": "1px solid rgb(107,99,246)"}}>
    {`Select File(s)`}
  </Button>
    <Text sx={{"height": "100px", "width": "200px"}}>
    {`Drag and drop files here or click to select files`}
  </Text>
  </Box>
  )}
</ReactDropzone>
  <HStack>
  <Button onClick={_e => Event([E("state.handle_upload", {}, "uploadFiles")], _e)}>
  {`Upload`}
</Button>
</HStack>
  <Heading>
  {`Files:`}
</Heading>
  <Fragment>
  {isTrue(state.is_uploading) ? (
  <Fragment>
  <Progress isIndeterminate={true} sx={{"color": "blue", "width": "100%"}}/>
</Fragment>
) : (
  <Fragment>
  <Progress sx={{"width": "100%"}} value={0}/>
</Fragment>
)}
</Fragment>
  <Textarea isDisabled={true} placeholder="No File" sx={{"width": "100%", "height": "100%", "bg": "white", "color": "black", "minHeight": "20em"}} value={state.file_str}/>
</VStack>
  <NextHead>
  <title>
  {`Upload`}
</title>
  <meta content="A Reflex app." name="description"/>
  <meta content="favicon.ico" property="og:image"/>
</NextHead>
</Fragment>
    </Fragment>
  )
}
