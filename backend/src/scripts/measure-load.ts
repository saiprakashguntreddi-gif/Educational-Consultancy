async function main() {
  console.log('--- STARTING TIMED TRACE ---');
  let t0 = Date.now();

  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'guntreddisaiprakash1703@gmail.com',
      password: 'StudentPassword123!'
    }),
  }).then(r => r.json());

  console.log('1. Login took:', Date.now() - t0, 'ms');
  const token = (loginRes as any).data?.tokens?.accessToken;
  const headers = { Authorization: 'Bearer ' + token };

  t0 = Date.now();
  await fetch('http://localhost:5000/api/v1/auth/me', { headers }).then(r => r.json());
  console.log('2. Auth/me took:', Date.now() - t0, 'ms');

  t0 = Date.now();
  await fetch('http://localhost:5000/api/v1/profile/me', { headers }).then(r => r.json());
  console.log('3. Profile/me took:', Date.now() - t0, 'ms');

  t0 = Date.now();
  await fetch('http://localhost:5000/api/v1/preferences/me', { headers }).then(r => r.json());
  console.log('4. Preferences/me took:', Date.now() - t0, 'ms');

  t0 = Date.now();
  await fetch('http://localhost:5000/api/v1/education/me', { headers }).then(r => r.json());
  console.log('5. Education/me took:', Date.now() - t0, 'ms');

  t0 = Date.now();
  await fetch('http://localhost:5000/api/v1/appointments/meta', { headers }).then(r => r.json());
  console.log('6. Appointments/meta took:', Date.now() - t0, 'ms');
}

main().catch(console.error).finally(() => process.exit(0));
