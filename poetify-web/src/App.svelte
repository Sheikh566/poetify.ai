<script>
  import { fly } from "svelte/transition";
  import Fetch, { hasAny } from "svelte-fetch";
  import { Jellyfish } from "svelte-loading-spinners";
  import {
    SvelteUIProvider,
    Button,
    TextInput,
    NativeSelect,
    Modal,
    Paper,
    Alert,
    Group,
    Text,
    Container,
    Center,
  } from "@svelteuidev/core";
  import IoKey from "svelte-icons-pack/io/IoKey";
  import Icon from "svelte-icons-pack/Icon.svelte";
  import BiSolidSave from "svelte-icons-pack/bi/BiSolidSave";
  import RiSystemAlertFill from "svelte-icons-pack/ri/RiSystemAlertFill";
  import RiDocumentFileCopyLine from "svelte-icons-pack/ri/RiDocumentFileCopyLine";

  const fetch = new Fetch();
  const moodList = ["Happy", "Sad", "Silly", "Romantic", "Stressed"];
  const poetList = [
    "William Shakespear",
    "William Wordsworth",
    "Jane Taylor",
    "Eminem",
  ];

  let poet = moodList[0],
    topic = "",
    mood = moodList[0],
    data = null,
    showAlert = false,
    openAIKey = localStorage.getItem("open_ai_key") || null,
    alertMessage = "",
    modalOpened = false;

  const submitForm = async () => {
    if (!openAIKey) {
      showAlert = true;
      alertMessage = "You have not provided you OpenAI API Key";
      setTimeout(() => {
        showAlert = false;
      }, 3000);
      return;
    }
    try {
      const response = await fetch.get(
        `http://localhost:3000?poet=${poet}&topic=${topic}&mood=${mood}`,
        { headers: { authorization: openAIKey } }
      );

      data = await response.json();
      if (data.status == 401) {
        showAlert = true;
        alertMessage = data.error;
        console.log({ alertMessage })
        setTimeout(() => {
          showAlert = false;
        }, 3000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const saveKey = () => {
    modalOpened = false;
    localStorage.setItem("open_ai_key", openAIKey);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.poem);
  };
</script>

<SvelteUIProvider id="main">
  <!-- API KEY MISSING ALERTER -->
  {#if showAlert}
    <div transition:fly={{ y: 200, duration: 1000 }} class="alert-box">
      <Alert variant="outline" radius="md">
        <Icon src={RiSystemAlertFill} size="20" color="#ff3e00" />
        {alertMessage}
      </Alert>
    </div>
  {/if}

  <!-- TOP SECTION -->
  <h1>Poetify.AI</h1>
  <p>Generate a copyright-free poem with Poetify</p>
  <Button on:click={() => (modalOpened = true)} ripple>
    <Icon src={IoKey} color="white" size="20" />
    &nbsp&nbsp OPENAI KEY
  </Button>

  <!-- MAIN FORM -->
  <form on:submit|preventDefault={submitForm}>
    <TextInput label="Topic:" bind:value={topic} required />

    <NativeSelect
      class="select"
      data={poetList}
      bind:value={poet}
      label="Poet:"
      required
    />

    <NativeSelect
      class="select"
      data={moodList}
      bind:value={mood}
      label="Mood:"
      required
    />

    <br />
    {#if $hasAny}
      <Center><Jellyfish duration="1s" /></Center>
    {:else}
      <Center>
        <Button type="submit" id="submit" ripple size="md">Generate</Button>
      </Center>
    {/if}
  </form>

  <!-- POEM PANEL -->
  {#if data?.poem}
    <Paper id="poem-text" shadow="xl">
      <Button
        on:click={copyToClipboard}
        compact
        variant="outline"
        color="orange"
      >
        <Icon src={RiDocumentFileCopyLine} size="20" color="#ff3e00" /> &nbsp&nbsp
        <Text size="xs">COPY</Text>
      </Button>
      <pre>{data.poem}</pre>
    </Paper>
  {/if}

  <!-- FOOTER -->
  <Container
    override={{ mt: "$10", bc: "#ff3e00", w: "180px", h: "15px", py: "3px" }}
  >
    <Text size="sm" align="center" color="white" weight="bold">
      Made with 💙 at <a href="https://iomechs.com">IOMechs</a>
    </Text>
  </Container>

  <!-- API KEY MODAL -->
  <Modal
    opened={modalOpened}
    target="body"
    on:close={() => (modalOpened = false)}
    title="Provide you OpenAI API key"
  >
    <p>
      You need to provide your OpenAI Key. If you don't have it. You can get one
      from <a href="https://platform.openai.com/">here.</a>
    </p>
    <Group grow class="modal-group">
      <TextInput bind:value={openAIKey} class="api-key-input" required />
      <Button class="api-key-save-btn" on:click={saveKey}>
        <Icon src={BiSolidSave} size="20" color="white" />
      </Button>
    </Group>
  </Modal>
</SvelteUIProvider>

<style>
  :global(#main) {
    padding: 1em;
    width: 350px;
    margin: 0 auto;
    --main-color: #ff3e00;
  }

  :global(#submit) {
    background-color: var(--main-color);
  }

  :global(.select select) {
    height: auto !important;
  }

  :global(.svelteui-Modal-title) {
    font-size: 20px !important;
    font-weight: 300 !important;
    color: var(--main-color) !important;
  }

  h1 {
    color: var(--main-color);
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 600;
  }

  @media (min-width: 640px) {
    :global(#main) {
      max-width: none;
    }
  }

  pre {
    font-size: 1.15em;
    color: var(--main-color);
  }

  :global(.api-key-save-btn) {
    max-width: 70px !important;
  }

  :global(.modal-group) {
    justify-content: space-between !important;
  }

  :global(.modal-group input) {
    width: 310px !important;
  }

  .alert-box {
    position: absolute;
    transform: translate(0, -10px);
    color: var(--main-color);
  }

  :global(.alert-box svg) {
    transform: translate(0, 5px);
  }

  :global(#poem-text button) {
    cursor: pointer;
  }

  :global(#poem-text pre) {
    white-space: pre-wrap;
  }
</style>
