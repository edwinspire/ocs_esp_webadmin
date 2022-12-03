<script>
  import { onMount } from "svelte/internal";
  import GpioComponent from "./components/gpio.svelte";
  import EnabledComponent from "./components/enable_button.svelte";

  let InputType = [
    { text: "NONE", value: 0 },
    { text: "ALARM_MEDICAL", value: 100 },
    { text: "ALARM_FIRE", value: 101 },
    { text: "ALARM_PANIC", value: 102 },
    { text: "ALARM_BURGLARY", value: 103 },
    { text: "ALARM_GENERAL", value: 104 },
    { text: "ALARM_24H", value: 105 },
  ];

  let SirenType = [
    { text: "UNABLED", value: 0 },
    { text: "SILENT", value: 1 },
    { text: "CONTINUOUS", value: 2 },
    { text: "PULSING", value: 3 },
    { text: "TEST", vaue: 4 },
  ];

  let StatusZone = [
    { text: "TROUBLE", value: 3 },
    { text: "NORMAL", value: 1 },
    { text: "ALARM", value: 2 },
    { text: "UNDEFINED", value: 0 },
  ];

  let ContactType = [
    { text: "NORMALLY_CLOSED", value: 1 },
    { text: "NORMALLY_OPENED", value: 2 },
  ];

  var link_osm = "";
  var rebooting = false;

  var statusInputs = [];

  var deviceSettings = {
    MAX_SSID_WIFI: 3,
    wsHost: "",
    cfp: "",
    acbgl: false,
    latitude: 0,
    longitude: 0,
    deviceId: "",
    i: [],
    o: [],
    //    tg: [],
    wf: [
      { ssid: "", pwd: "" },
      { ssid: "", pwd: "" },
      { ssid: "", pwd: "" },
    ],
  };

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        deviceSettings = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  async function setSettings() {
    if (confirm("Desea guardar los cambios?")) {
      try {
        let response = await fetch("/setsettings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deviceSettings),
        });
        let data = await response.json();
        console.log(data);
        if (data) {
          alert("Guardado");
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function getSettings() {
    try {
      let response = await fetch("/getsettings");
      let data = await response.json();

      //    console.log("Retorna settings", deviceSettings);

      if (data) {
        deviceSettings = {
          MAX_SSID_WIFI: data.MAX_SSID_WIFI || 3,
          cfp: data.cfp || "",
          acbgl: data.acbgl || false,
          wsHost: data.wsHost || "",
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          deviceId: data.deviceId || "",
          name: data.name || "",
          i: data.i || [],
          o: data.o || [],
          tg: data.tg || [],
          wf: data.wf || [],
          ChipModel: data.ChipModel || "",
          EfuseMac: data.EfuseMac || "",
        };

        //        console.log("settings 1: ", deviceSettings);

        deviceSettings.tg = deviceSettings.tg.map((tg) => {
          return {
            id: tg.id || "",
            name: tg.name || "",
            enabled: tg.enabled || false,
          };
        });

        console.log("settings 2: ", deviceSettings);
      }
    } catch (error) {
      console.trace(error);
    }
  }

  async function getInputStatus() {
    try {
      let response = await fetch("/getinputsstatus");
      let data = await response.json();

      console.log("getInputStatus : ", data);

      if (data && Array.isArray(data)) {
        statusInputs = data;
      } else {
        statusInputs = [];
      }
    } catch (error) {
      console.trace(error);
    }
  }

  function getGeoFromLink() {
    try {
      let params = new URL(link_osm).searchParams;
      deviceSettings.latitude = params.get("mlat"); // is the string "Jonathan Smith".
      deviceSettings.longitude = params.get("mlon"); // is the string "Jonathan Smith".
    } catch (error) {
      alert("El link ingresado no es válido");
    }
  }

  async function reboot() {
    if (confirm("Desea reiniciar la placa?")) {
      try {
        await fetch("/reboot", {
          method: "GET",
        });
        rebooting = true;
        setTimeout(async () => {
          rebooting = false;
          await getsettings();
        }, 10000);
      } catch (error) {
        console.log(error);
      }
    }
  }

  onMount(() => {
    setInterval(async () => {
      await getInputStatus();
    }, 1500);
  });
</script>

<div class="bg">
  <h1 style="color:darkblue;">OPEN COMMUNITY SAFETY</h1>
  <div class="button_ali">
    <button class="button button1" on:click={reboot} disabled={rebooting}
      >Reboot Board.</button
    >
    <button class="button button1" on:click={getSettings} disabled={rebooting}
      >Get settings</button
    >
    <button class="button button1" on:click={setSettings} disabled={rebooting}
      >Save settings</button
    >
  </div>

  <fieldset class="fset">
    <legend class="legent">General</legend>

    <div class="flex-container">
      <div class="f5">
        <label for="fname">Chip Model</label>
        <input disabled bind:value={deviceSettings.ChipModel} />
      </div>

      <div class="f5">
        <label for="lname">MAC</label>
        <input disabled bind:value={deviceSettings.EfuseMac} />
      </div>
    </div>

    <div>
      <label for="fname">Name</label>
      <input
        type="text"
        name="deviceId"
        maxlength="30"
        bind:value={deviceSettings.name}
      />
    </div>

    <div>
      <label for="fname">Device ID</label>
      <input
        type="text"
        name="deviceId"
        maxlength="50"
        bind:value={deviceSettings.deviceId}
      />
    </div>

    <div>
      <label for="fname">Websocket Host</label>
      <input type="text" name="wsHost" bind:value={deviceSettings.wsHost} />
    </div>
  </fieldset>

  <fieldset class="fset">
    <legend class="legent">Geolocation</legend>

    <div class="flex-container">
      <div class="f5">
        <label for="fname">Latitude</label>
        <input type="text" bind:value={deviceSettings.latitude} />
      </div>

      <div class="f5">
        <label for="lname">Longitude</label>
        <input type="text" bind:value={deviceSettings.longitude} />
      </div>
    </div>

    <div>
      <label for="lname">From Open Street Maps Link</label>
      <input type="text" bind:value={link_osm} on:change={getGeoFromLink} />
    </div>

    <div class="flex-container">
      <div class="f0">
        <EnabledComponent bind:enabled={deviceSettings.acbgl} />
      </div>
      <div class="f6">Allow device for community use by geolocation</div>
    </div>

    <div class="href_gelocation">
      <!-- svelte-ignore security-anchor-rel-noreferrer -->
      <a
        target="_blank"
        href={`https://www.openstreetmap.org/?mlat=${deviceSettings.latitude}&mlon=${deviceSettings.longitude}#map=19/${deviceSettings.latitude}/${deviceSettings.longitude}`}
        >Show on Open Street Maps</a
      >
    </div>
  </fieldset>

  <fieldset class="fset">
    <legend class="legent">WIFI</legend>

    <div class="flex-container">
      <div class="f5">
        <label for="fname">SSID Name</label>
        {#each deviceSettings.wf as { wf }, i}
          <input
            type="text"
            maxlength="15"
            disabled={i == 0}
            bind:value={deviceSettings.wf[i].ssid}
          />
        {/each}
      </div>

      <div class="f5">
        <label for="lname">Password</label>
        {#each deviceSettings.wf as { wf }, i}
          <input
            type="password"
            disabled={i == 0}
            bind:value={deviceSettings.wf[i].pwd}
          />
        {/each}
      </div>
    </div>
  </fieldset>

  <fieldset class="fset">
    <legend class="legent">Inputs</legend>

    <div class="flex-container">
      <div class="f0">
        <label for="lname">Enabled</label>
        {#each deviceSettings.i as { input }, i}
          <EnabledComponent bind:enabled={deviceSettings.i[i].enabled} />
        {/each}
      </div>

      <div class="f4">
        <label for="lname">Label</label>
        {#each deviceSettings.i as { input }, i}
          <input
            type="text"
            maxlength="15"
            bind:value={deviceSettings.i[i].name}
          />
        {/each}
      </div>

      <div class="f1">
        <label for="fname">GPIO</label>
        {#each deviceSettings.i as { input }, i}
          <GpioComponent bind:gpio={deviceSettings.i[i].gpio} />
        {/each}
      </div>
      <div class="f2">
        <label for="fname">Input Type</label>
        {#each deviceSettings.i as { input }, i}
          <div>
            <select bind:value={deviceSettings.i[i].type}>
              {#each InputType as itype}
                <option value={itype.value}>
                  {itype.text}
                </option>
              {/each}
            </select>
          </div>
        {/each}
      </div>

      <div class="f2">
        <label for="fname">Contact Type</label>
        {#each deviceSettings.i as { ct }, i}
          <div>
            <select bind:value={deviceSettings.i[i].contact_type}>
              {#each ContactType as itype}
                <option value={itype.value}>
                  {itype.text}
                </option>
              {/each}
            </select>
          </div>
        {/each}
      </div>

      <div class="f2">
        <label for="fname">Siren Type</label>
        {#each deviceSettings.i as { st }, i}
          <div>
            <select bind:value={deviceSettings.i[i].siren_type}>
              {#each SirenType as itype}
                <option value={itype.value}>
                  {itype.text}
                </option>
              {/each}
            </select>
          </div>
        {/each}
      </div>
      <div class="f2">
        <label for="fname">Status Zone</label>
        {#each statusInputs as { st }, i}
          <div>
            <select disabled bind:value={statusInputs[i].status}>
              {#each StatusZone as itype}
                <option value={itype.value}>
                  {itype.text}
                </option>
              {/each}
            </select>
          </div>
        {/each}
      </div>
      <div class="f1">
        <label for="lname">Value</label>
        {#each statusInputs as { v }, i}
          <input type="text" disabled bind:value={statusInputs[i].value} />
        {/each}
      </div>
    </div>
  </fieldset>

  <fieldset class="fset">
    <legend class="legent">Outputs</legend>

    <div class="flex-container">
      <div class="f0">
        <label for="lname">Enabled</label>
        {#each deviceSettings.o as { o }, i}
          <EnabledComponent bind:enabled={deviceSettings.o[i].enabled} />
        {/each}
      </div>

      <div class="f6">
        <label for="lname">Label</label>
        {#each deviceSettings.o as { o }, i}
          <input
            type="text"
            maxlength="15"
            bind:value={deviceSettings.o[i].name}
          />
        {/each}
      </div>
      <div class="f3">
        <label for="fname">GPIO</label>
        {#each deviceSettings.o as { o }, i}
          <GpioComponent bind:gpio={deviceSettings.o[i].gpio} />
        {/each}
      </div>
    </div>
  </fieldset>
  <!-- 
  <fieldset class="fset">
    <legend class="legent">Telegram Group</legend>

    <div class="flex-container">
      <div class="f0">
        <label for="lname">Enabled</label>
        {#each deviceSettings.tg as { o }, i}
          <EnabledComponent bind:enabled={deviceSettings.tg[i].enabled} />
        {/each}
      </div>

      <div class="f6">
        <label for="lname">Name</label>
        {#each deviceSettings.tg as { o }, i}
          <input
            type="text"
            maxlength="15"
            bind:value={deviceSettings.tg[i].name}
          />
        {/each}
      </div>
      <div class="f3">
        <label for="fname">Id</label>
        {#each deviceSettings.tg as { o }, i}
          <input
            type="text"
            maxlength="50"
            bind:value={deviceSettings.tg[i].id}
          />
        {/each}
      </div>
    </div>
  </fieldset>
 -->
  <fieldset class="fset">
    <legend class="legent">SSL Certificate</legend>
    <textarea class="ca" rows="25" cols="50" bind:value={deviceSettings.cfp} />
  </fieldset>
</div>

<style>
  .fset {
    margin: 1em;
  }
  .href_gelocation {
    text-align-last: end;
  }

  .ca {
    background-color: #2b349f;
    width: 100%;
  }

  .flex-container {
    display: -webkit-flex;
    display: flex;
    -webkit-align-items: stretch;
    align-items: stretch;
    width: auto;
    height: auto;
  }

  input {
    width: 100%;
    padding: 12px 20px;
    margin: 4px 0;
    box-sizing: border-box;
    border: none;
    background-color: #2b349f;
    color: white;
  }

  select {
    background-color: #2b349f;
    color: white;
    margin: 4px 0;
    height: 40px;
    width: 100%;
  }

  .button {
    border: none;
    color: white;
    padding: 16px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    transition-duration: 0.4s;
    cursor: pointer;
  }

  .button1 {
    background-color: white;
    color: black;
    border: 2px solid #2b349f;
  }

  .button1:hover {
    background-color: #2b349f;
    color: white;
  }

  .button_ali {
    text-align: end;
  }

  .legent {
    font-size: 1.5em;
  }

  .f0 {
    margin: 5px;
  }
  .f1 {
    flex-grow: 1;
    margin: 5px;
  }
  .f2 {
    flex-grow: 2;
    margin: 5px;
  }
  .f3 {
    flex-grow: 3;
    margin: 5px;
  }
  .f4 {
    flex-grow: 4;
    margin: 5px;
  }
  .f5 {
    flex-grow: 5;
    margin: 5px;
  }
  .f6 {
    flex-grow: 6;
    margin: 5px;
  }
</style>
