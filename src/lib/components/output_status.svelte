<script>
	export let value = true;
	export let label = '';
export let  disabled = false;
	$: new_text = text_label(value);

	let class_status = '';

	/**
	 * @param {string | boolean} v
	 */
	function text_label(v) {
		if (v) {
			class_status = 'actived';
			return 'Actived';
		} else {
			class_status = 'normal';
			return 'Inactived';
		}
	}
</script>

{#if label && label.length > 0}
	<label for="fname">{label}</label>
{/if}

<input class={class_status} disabled={disabled} type="text" value={new_text} />

<style>
	.normal {
		width: 100%;
		padding: 12px 20px;
		margin: 4px 0;
		box-sizing: border-box;
		border: none;
		background-color: green !important;
		color: white;
	}

	.actived {
		width: 100%;
		padding: 12px 20px;
		margin: 4px 0;
		box-sizing: border-box;
		border: none;
		background-color: red !important;
		color: white;
	}
</style>
