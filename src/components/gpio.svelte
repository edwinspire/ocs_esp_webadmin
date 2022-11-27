<script>
  export let gpio;
</script>

<input type="number" min="0" step="1" max="255" bind:value={gpio} />

<style>
    
  input {
    width: 100%;
    padding: 12px 20px;
    margin: 4px 0;
    box-sizing: border-box;
    border: none;
    background-color: #2b349f;
    color: white;
  }

</style>
