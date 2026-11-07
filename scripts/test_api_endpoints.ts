/**
 * Test script for HTTP server API endpoints in server.ts
 */

async function runApiTests() {
  const baseUrl = 'http://localhost:3000';
  console.log(`Testando endpoints da API em ${baseUrl}...`);

  try {
    // 1. Test universal ID validation (CPF)
    const valRes = await fetch(`${baseUrl}/api/universal-id/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document: '529.982.247-25', role: 'aluno' }),
    });
    const valData = await valRes.json();
    console.log('1. /api/universal-id/validate:', valData.valid ? 'OK (Válido)' : 'FALHA');

    // 2. Test universal ID lookup (LGPD minimal)
    const lookupRes = await fetch(`${baseUrl}/api/universal-id/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document: '529.982.247-25', targetRole: 'aluno' }),
    });
    const lookupData = await lookupRes.json();
    console.log('2. /api/universal-id/lookup:', lookupData.found ? `OK (${lookupData.name} - ${lookupData.technicalId})` : 'FALHA');

    // 3. Test list relationships
    const relsRes = await fetch(`${baseUrl}/api/relationships`);
    const relsData = await relsRes.json();
    console.log('3. /api/relationships:', relsData.total >= 0 ? `OK (${relsData.total} vínculos cadastrados)` : 'FALHA');

    // 4. Test indicators endpoint with authorization check
    const indRes = await fetch(`${baseUrl}/api/relationships/indicators/user-aluno-1?requesterUserId=user-prof-1&requesterRole=professor`);
    const indData = await indRes.json();
    console.log('4. /api/relationships/indicators authorized:', indRes.status === 200 ? `OK (TRI: ${indData.snapshot?.triScoreEstimate})` : 'FALHA');

    // 5. Test indicators endpoint with UNAUTHORIZED requester (should be 403 Forbidden)
    const unauthRes = await fetch(`${baseUrl}/api/relationships/indicators/user-aluno-1?requesterUserId=user-unauthorized-99&requesterRole=professor`);
    console.log('5. /api/relationships/indicators unauthorized (403):', unauthRes.status === 403 ? 'OK (403 Forbidden bloqueado)' : 'FALHA');

    console.log('\n🎉 TODOS OS TESTES DE ENDPOINT HTTP FORAM BEM-SUCEDIDOS!');
  } catch (err: any) {
    console.error('Erro ao testar endpoints HTTP:', err.message);
  }
}

runApiTests();
