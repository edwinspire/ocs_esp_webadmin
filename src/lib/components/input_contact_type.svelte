<script>
	export let contact_type = 0;

	let ContactType = [
		{ text: 'NORMALLY_CLOSED', value: 1 },
		{ text: 'NORMALLY_OPENED', value: 2 }
	];
</script>

<select bind:value={contact_type}>
	{#each ContactType as itype}
		<option value={itype.value}>
			{itype.text}
		</option>
	{/each}
</select>
