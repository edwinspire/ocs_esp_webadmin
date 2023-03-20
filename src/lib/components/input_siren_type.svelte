<script>
	export let siren_type = 0;

	let SirenType = [
		{ text: 'UNABLED', value: 0 },
		{ text: 'SILENT', value: 1 },
		{ text: 'CONTINUOUS', value: 2 },
		{ text: 'PULSING', value: 3 },
		{ text: 'TEST', vaue: 4 }
	];
</script>

<div class="select is-small">
	<select bind:value={siren_type}>
		{#each SirenType as itype}
			<option value={itype.value}>
				{itype.text}
			</option>
		{/each}
	</select>
</div>
