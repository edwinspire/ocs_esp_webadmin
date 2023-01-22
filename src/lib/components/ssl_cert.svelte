<script>
	/**
	 * @type {any}
	 */
	export let cfg;
</script>

<fieldset class="fset">
	<legend class="legent">SSL Certificate</legend>
	<textarea class="ca" rows="25" cols="50" maxlength="2000" bind:value={cfg} />
</fieldset>

<style>
	.fset {
		margin: 1em;
	}

	.ca {
		background-color: #333;
		width: 100%;
		color: white;
	}
	.legent {
		font-size: 1.5em;
	}
</style>
