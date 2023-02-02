<script>
	import Menu from '$lib/components/menu.svelte';
	import { createEventDispatcher } from 'svelte';
	import { dispatch_events } from '$lib/class/utils.js';
	import { version } from '$app/environment';

	let iuser = 'admin';
	let ipwd = 'admin' + version.substring(version.length - 4);
	let user = '';
	let pwd = '';

	const dispatch = createEventDispatcher();
</script>

<Menu
	isLogin={true}
	show_download={false}
	show_get={false}
	show_reboot={false}
	show_save={false}
	on:event={(e) => {
		if (e.detail.name == 'page' && e.detail.value == 'status') {
			if (user == iuser && pwd == ipwd) {
				dispatch_events(dispatch, e.detail.name, e.detail.value);
			} else {
				alert('Invalid credentials');
			}
		}
	}}
/>

<div class="container">
	<div class="row">
		<div class="col-lg-3 col-md-2" />
		<div class="col-lg-6 col-md-8 login-box">
			<div class="col-lg-12 login-form">
				<div class="col-lg-12 login-form">
					<form>
						<div class="form-group">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="form-control-label">USERNAME</label>
							<input type="text" class="form-control" bind:value={user} />
						</div>
						<div class="form-group">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="form-control-label">PASSWORD</label>
							<input type="password" class="form-control" bind:value={pwd} />
						</div>
					</form>
				</div>
			</div>
			<div class="col-lg-3 col-md-2" />
		</div>
	</div>
</div>

<style>
	.login-box {
		height: auto;
		background: #333;
		text-align: center;
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
	}

	.login-form {
		text-align: left;
	}

	input[type='text'] {
		background-color: #1a2226;
		border: none;
		border-bottom: 2px solid #0db8de;
		border-top: 0px;
		border-radius: 0px;
		font-weight: bold;
		outline: 0;
		margin-bottom: 20px;
		padding-left: 0px;
		color: #ecf0f5;
	}

	input[type='password'] {
		background-color: #1a2226;
		border: none;
		border-bottom: 2px solid #0db8de;
		border-top: 0px;
		border-radius: 0px;
		font-weight: bold;
		outline: 0;
		padding-left: 0px;
		margin-bottom: 20px;
		color: #ecf0f5;
	}

	.form-group {
		margin-bottom: 40px;
		outline: 0px;
	}

	.form-control:focus {
		border-color: inherit;
		-webkit-box-shadow: none;
		box-shadow: none;
		border-bottom: 2px solid #0db8de;
		outline: 0;
		background-color: #1a2226;
		color: #ecf0f5;
	}

	input:focus {
		outline: none;
		box-shadow: 0 0 0;
	}

	label {
		margin-bottom: 0px;
	}

	.form-control-label {
		font-size: 10px;
		color: #6c6c6c;
		font-weight: bold;
		letter-spacing: 1px;
	}
</style>
