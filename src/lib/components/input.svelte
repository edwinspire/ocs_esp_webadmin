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

{#if label && label.length > 0}
	<label for="fname">{label}</label>
{/if}

{#if type == 'text'}
	<input type="text" {maxlength} bind:value {disabled} on:change={change} />
{:else if type == 'number'}
	<input type="number" {min} {step} {maxlength} bind:value {disabled} on:change={change} />
{:else if type == 'password'}
	<input type="password" {maxlength} bind:value {disabled} on:change={change} />
{:else if type == 'email'}
	<input type="email" {maxlength} bind:value {disabled} on:change={change} />
{:else if type == 'date'}
	<input type="date" {maxlength} bind:value {disabled} on:change={change} />
{:else if type == 'datetime-local'}
	<input type="datetime-local" {maxlength} bind:value {disabled} on:change={change} />
{/if}
