// Utilitário para gerar fingerprint único do dispositivo
export const generateDeviceFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('Device fingerprint', 2, 2);
  
  const fingerprint = {
    screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    userAgent: navigator.userAgent.slice(0, 100), // Limitado para evitar dados muito longos
    canvas: canvas.toDataURL().slice(0, 100),
    memory: navigator.deviceMemory || 'unknown',
    cores: navigator.hardwareConcurrency || 'unknown',
    touchSupport: 'ontouchstart' in window,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    timestamp: Date.now()
  };

  // Gera hash simples baseado nas características
  const fingerprintString = JSON.stringify(fingerprint);
  let hash = 0;
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converte para 32bit integer
  }
  
  return Math.abs(hash).toString(16);
};

// Função para obter ou criar ID único do dispositivo
export const getDeviceId = () => {
  const storageKey = 'desabafa-device-id';
  let deviceId = localStorage.getItem(storageKey);
  
  if (!deviceId) {
    // Combina fingerprint com timestamp para garantir unicidade
    const fingerprint = generateDeviceFingerprint();
    const timestamp = Date.now().toString(36);
    deviceId = `${fingerprint}-${timestamp}`;
    localStorage.setItem(storageKey, deviceId);
  }
  
  return deviceId;
};

// Função para obter informações do dispositivo
export const getDeviceInfo = () => {
  return {
    id: getDeviceId(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    createdAt: new Date().toISOString()
  };
};

