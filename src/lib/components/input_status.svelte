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
				class_status = 'progress is-primary is-small';
				s = 'Normal';
				break;
			case 2:
				class_status = 'progress is-danger is-small';
				s = 'Alarm';
				break;
			case 3:
				class_status = 'progress is-warning is-small';
				s = 'Trouble';
				break;
			default:
				class_status = 'progress is-small';
				s = 'Valor';
				break;
		}

		return s.padEnd(11, ' ') + v;
	}
</script>

{#if label && label.length > 0}
	<label for="fname">{label}</label>
{/if}
<div>{new_text}</div>

{#if value > 0}
	<progress class={class_status} max="4096" {value}>0%</progress>
{:else}
	<progress class={class_status} max="4096">0%</progress>
{/if}
