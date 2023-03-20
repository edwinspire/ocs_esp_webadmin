<script>
	export let type = 0;
	export let disabled = false;
	let InputType = [
		{ text: 'NONE', value: 0 },
		{ text: 'ALARM_MEDICAL', value: 100 },
		{ text: 'ALARM_FIRE', value: 101 },
		{ text: 'ALARM_PANIC', value: 102 },
		{ text: 'ALARM_BURGLARY', value: 103 },
		{ text: 'ALARM_GENERAL', value: 104 },
		{ text: 'ALARM_24H', value: 105 }
	];
</script>

<div class="select is-small">
	<select bind:value={type} {disabled}>
		{#each InputType as itype}
			<option value={itype.value}>
				{itype.text}
			</option>
		{/each}
	</select></div>

