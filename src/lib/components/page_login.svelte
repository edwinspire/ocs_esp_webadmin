<script>
	import { onMount } from 'svelte';
	import Menu from '$lib/components/menu.svelte';
	import { createEventDispatcher } from 'svelte';
	import { dispatch_events } from '$lib/class/utils.js';
	import { version } from '$app/environment';

	let iuser = 'admin';
	let ipwd = 'admin' + version.substring(version.length - 4);
	let user = '';
	let pwd = '';

	const dispatch = createEventDispatcher();

	onMount(() => {});
</script>

<div class="modal">
	<form class="modal-content animate" action="#" method="post">
		<div class="container">
			<label for="uname"><b>Username</b></label>
			<input type="text" placeholder="Enter Username" required bind:value={user} />

			<label for="psw"><b>Password</b></label>
			<input type="password" placeholder="Enter Password" required bind:value={pwd} />
		</div>

		<div class="container" style="background-color:#f1f1f1">
			<button
				type="button"
				class="loginbtn"
				on:click={(e) => {
					if (user == iuser && pwd == ipwd) {
						dispatch_events(dispatch, 'page', 'status');
					} else {
						alert('Invalid credentials');
					}
				}}>Login</button
			>
			<button type="button" class="exitbtn">Cancel</button>
		</div>
	</form>
</div>

<style>
	/* Full-width input fields */
	input[type='text'],
	input[type='password'] {
		width: 100%;
		padding: 12px 20px;
		margin: 8px 0;
		display: inline-block;
		border: 1px solid #ccc;
		box-sizing: border-box;
	}

	/* Set a style for all buttons */
	button {
		background-color: #04aa6d;
		color: white;
		padding: 14px 20px;
		margin: 8px 0;
		border: none;
		cursor: pointer;
		width: 100%;
	}

	button:hover {
		opacity: 0.8;
	}

	/* Extra styles for the cancel button */
	.loginbtn {
		width: auto;
		padding: 10px 18px;
		background-color: #333;
	}

	.container {
		padding: 16px;
	}

	.exitbtn {
		float: right;
		width: auto;
		padding: 10px 18px;
		background-color: #f44336;
	}

	/* The Modal (background) */
	.modal {
		position: fixed; /* Stay in place */
		z-index: 1; /* Sit on top */
		left: 0;
		top: 0;
		width: 100%; /* Full width */
		height: 100%; /* Full height */
		overflow: auto; /* Enable scroll if needed */
		background-color: rgb(0, 0, 0); /* Fallback color */
		background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
		padding-top: 60px;
	}

	/* Modal Content/Box */
	.modal-content {
		background-color: #fefefe;
		margin: 5% auto 15% auto; /* 5% from the top, 15% from the bottom and centered */
		border: 1px solid #888;
		width: 80%; /* Could be more or less, depending on screen size */
	}

	/* Add Zoom Animation */
	.animate {
		-webkit-animation: animatezoom 0.6s;
		animation: animatezoom 0.6s;
	}

	@-webkit-keyframes animatezoom {
		from {
			-webkit-transform: scale(0);
		}
		to {
			-webkit-transform: scale(1);
		}
	}

	@keyframes animatezoom {
		from {
			transform: scale(0);
		}
		to {
			transform: scale(1);
		}
	}

</style>
