<script>
	export let value = 0;
	export let status = 0;
	export let label = '';

	$: new_text = text_label(value);

	let class_status = '';

	/**
	 * @param {string | number} v
	 */
	function text_label(v) {
		let s = 'Undefined';
		switch (status) {
			case 1:
				class_status = 'normal';
				s = 'Normal';
				break;
			case 2:
				class_status = 'alarm';
				s = 'Alarm';
				break;
			case 3:
				class_status = 'trouble';
				s = 'Trouble';
				break;
			default:
				class_status = '';
				s = 'Undefined';
				break;
		}

		return s.padEnd(11, ' ') + v;
	}
</script>

{#if label && label.length > 0}
	<label for="fname">{label}</label>
{/if}

<input class={class_status} disabled type="text" value={new_text} />

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

	.alarm {
		width: 100%;
		padding: 12px 20px;
		margin: 4px 0;
		box-sizing: border-box;
		border: none;
		background-color: red !important;
		color: white;
	}
	.trouble {
		width: 100%;
		padding: 12px 20px;
		margin: 4px 0;
		box-sizing: border-box;
		border: none;
		background-color: yellow !important;
		color: white;
	}
</style>
