<script>
  import { onMount } from "svelte/internal";

  var rebooting = false;
  var deviceSettings = {
    MAX_SSID_WIFI: 3,
    websocketHost: "",
    caCert_fingerPrint: "",
    latitude: 0,
    longitude: 0,
    deviceId: "",
    input: [],
    output: [],
    wifi: [
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
    let response = await fetch("/getsettings");
    let data = await response.json();

    console.log("Retorna settings", deviceSettings);

    if (data) {
      //    MAX_SSID = data.MAX_SSID || 3;

      deviceSettings = {
        MAX_SSID_WIFI: data.MAX_SSID_WIFI || 3,
        caCert_fingerPrint: data.caCert_fingerPrint || "",
        websocketHost: data.websocketHost || "",
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        deviceId: data.deviceId || "",
        input: data.input || [],
        output: data.output || [],
      };
      deviceSettings.wifi = [];
      if (data.wifi && Array.isArray(data.wifi)) {
        data.wifi.forEach((element) => {
          deviceSettings.wifi.push({ ssid: element.ssid, pwd: element.pwd });
        });
      }

      // Esto es para completar la cantidad de SSIDs, por ejemplo si llegan solo 2 SSID se completa a MAX_SSID_WIFI para que se creen los casilleros en la página
      let ssid_length = deviceSettings.MAX_SSID_WIFI + 1;
      if (deviceSettings.wifi) {
        ssid_length = deviceSettings.MAX_SSID_WIFI - deviceSettings.wifi.length;
      }

      console.log(deviceSettings, ssid_length);

      let i = 0;
      while (i < ssid_length) {
        deviceSettings.wifi.push({ ssid: "", pwd: "" });
        i++;
      }

      console.log("settings: ", deviceSettings);
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

  onMount(async () => {});
</script>

<div class="bg">
  <h1 style="color: darkcyan;">OPEN COMMUNITY SAFETY</h1>
  <div class="button_ali">
    <button class="button button1" on:click={reboot} disabled={rebooting}
      >Reboot Board</button
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
      <label for="fname">Device ID</label>
      <input
        type="text"
        name="deviceId"
        maxlength="40"
        bind:value={deviceSettings.deviceId}
      />
    </div>

    <div>
      <label for="fname">Websocket Host</label>
      <input
        type="text"
        name="websockethost"
        bind:value={deviceSettings.websocketHost}
      />
    </div>
  </fieldset>

  <fieldset class="fset">
    <legend class="legent">Geolocation</legend>

    <div class="flex-container">
      <div class="f5">
        <label for="fname">Latitude</label>
        <input type="text" name="geox" bind:value={deviceSettings.latitude} />
      </div>

      <div class="f5">
        <label for="lname">Longitude</label>
        <input type="text" name="geoy" bind:value={deviceSettings.longitude} />
      </div>
    </div>

    <div class="href_gelocation">
      <!-- svelte-ignore security-anchor-rel-noreferrer -->
      <a
        target="_blank"
        href={`https://www.openstreetmap.org/?mlat=${deviceSettings.latitude}&mlon=${deviceSettings.longitude}#map=19/${deviceSettings.latitude}/${deviceSettings.longitude}`}
        >Show map</a
      >
    </div>
  </fieldset>

  <fieldset class="fset">
    <legend class="legent">WIFI</legend>

    <div class="flex-container">
      <div class="f5">
        <label for="fname">SSID Name</label>
        {#each deviceSettings.wifi as { wifi }, i}
          <input
            type="text"
            maxlength="15"
            disabled={i == 0}
            bind:value={deviceSettings.wifi[i].ssid}
          />
        {/each}
      </div>

      <div class="f5">
        <label for="lname">Password</label>
        {#each deviceSettings.wifi as { wifi }, i}
          <input
            type="password"
            disabled={i == 0}
            bind:value={deviceSettings.wifi[i].pwd}
          />
        {/each}
      </div>
    </div>
  </fieldset>

  <fieldset class="fset">
    <legend class="legent">Inputs</legend>

    <div class="flex-container">
      <div class="f1">
        <label for="lname">Enabled</label>
        {#each deviceSettings.input as { input }, i}
          <span class="sliderb">
            <label class="switch">
              <input
                type="checkbox"
                bind:checked={deviceSettings.input[i].enabled}
              />
              <span class="slider" />
            </label></span
          >
        {/each}
      </div>

      <div class="f6">
        <label for="lname">Label</label>
        {#each deviceSettings.input as { input }, i}
          <input
            type="text"
            maxlength="15"
            bind:value={deviceSettings.input[i].name}
          />
        {/each}
      </div>

      <div class="f3">
        <label for="fname">GPIO Input</label>
        {#each deviceSettings.input as { input }, i}
          <input
            type="number"
            min="1"
            step="1"
            max="255"
            bind:value={deviceSettings.input[i].gpio}
          />
        {/each}
      </div>
    </div>
  </fieldset>

  <fieldset class="fset">
    <legend class="legent">Outputs</legend>

    <div class="flex-container">
      <div class="f1">
        <label for="lname">Enabled</label>
        {#each deviceSettings.output as { wifi }, i}
          <span class="sliderb">
            <label class="switch">
              <input
                type="checkbox"
                bind:checked={deviceSettings.output[i].enabled}
              />
              <span class="slider" />
            </label></span
          >
        {/each}
      </div>

      <div class="f6">
        <label for="lname">Label</label>
        {#each deviceSettings.output as { output }, i}
          <input
            type="text"
            maxlength="15"
            bind:value={deviceSettings.output[i].name}
          />
        {/each}
      </div>
      <div class="f3">
        <label for="fname">GPIO Output</label>
        {#each deviceSettings.output as { output }, i}
          <input
            type="number"
            min="1"
            step="1"
            max="255"
            bind:value={deviceSettings.output[i].name}
          />
        {/each}
      </div>
    </div>
  </fieldset>

  <fieldset class="fset">
    <legend class="legent">SSL Certificate</legend>
    <textarea
      class="ca"
      rows="25"
      cols="50"
      bind:value={deviceSettings.caCert_fingerPrint}
    />
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
    margin: 8px 0;
    box-sizing: border-box;
    border: none;
    background-color: #2b349f;
    color: white;
  }

  /*
  select {
    width: 100%;
    padding: 12px 20px;
    margin: 7px 0;
    box-sizing: border-box;
    border: none;
    background-color: #2b349f;
    color: white;
  }
*/
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
  .switch {
    position: relative;
    display: inline-block;
    width: 65px;
    height: 39px;
    margin: 8px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 30px;
    width: 30px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  input:checked + .slider {
    background-color: #2196f3;
  }

  input:focus + .slider {
    box-shadow: 0 0 1px #2196f3;
  }

  input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }
  .sliderb {
    width: 100%;
    box-sizing: border-box;
    border: none;
    display: block;
  }

  .f5 {
    flex-grow: 5;
    margin: 10px;
  }
  .f1 {
    flex-grow: 1;
    margin: 10px;
  }
  .f6 {
    flex-grow: 1;
    margin: 10px;
  }
  .f3 {
    flex-grow: 1;
    margin: 10px;
  }
</style>
