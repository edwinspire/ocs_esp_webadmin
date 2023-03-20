<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function change() {
		dispatch('change', {
			value: value
		});
	}
	/**
	 * @type {string}
	 */
	export let label = '';
	/**
	 * @type {any}
	 */
	export let type = 'text';
	/**
	 * @type {any}
	 */
	export let maxlength = 30;
	/**
	 * @type {any}
	 */
	export let value;

	/**
	 * @type {boolean}
	 */
	export let disabled = false;

	export let min = '0';
	export let step = '1';
</script>

<div class="field">
	{#if label && label.length > 0}
		<label class="label is-small" for="fname">{label}</label>
	{/if}
	<div class="control">
		{#if type == 'text'}
			<input
				class="input is-small"
				type="text"
				{maxlength}
				bind:value
				{disabled}
				on:change={change}
			/>
		{:else if type == 'number'}
			<input
				class="input is-small"
				type="number"
				{min}
				{step}
				{maxlength}
				bind:value
				{disabled}
				on:change={change}
			/>
		{:else if type == 'password'}
			<input
				class="input is-small"
				type="password"
				{maxlength}
				bind:value
				{disabled}
				on:change={change}
			/>
			{:else if type == 'checkbox'}
			<input
				class="checkbox"
				type="checkbox"
				{maxlength}
				bind:value
				{disabled}
				on:change={change}
			/>

			{:else if type == 'email'}
			<input
				class="input is-small"
				type="email"
				{maxlength}
				bind:value
				{disabled}
				on:change={change}
			/>
		{:else if type == 'date'}
			<input
				class="input is-small"
				type="date"
				{maxlength}
				bind:value
				{disabled}
				on:change={change}
			/>
		{:else if type == 'datetime-local'}
			<input
				class="input is-small"
				type="datetime-local"
				{maxlength}
				bind:value
				{disabled}
				on:change={change}
			/>
		{/if}
	</div>
</div>
