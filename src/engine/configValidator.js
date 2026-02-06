/**
 * Config Validator for T-Mail and GoldED configurations
 * Validates FidoNet addresses, paths, and configuration correctness
 */

// Correct values for the game puzzle
const CORRECT_VALUES = {
  address: '2:5020/123.45',
  bossAddress: '2:5020/123',
  password: 'NEXUS95',
  bossPhone: '555-3389',
};

/**
 * Validates FidoNet address format: Z:NNNN/NNN.PP or Z:NNNN/NNN
 * Zone:Net/Node.Point
 *
 * Examples:
 * - 2:5020/123 (node address)
 * - 2:5020/123.45 (point address)
 */
export function validateFidoAddress(address) {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Адрес не может быть пустым' };
  }

  const trimmed = address.trim();

  // Pattern: Zone:Net/Node or Zone:Net/Node.Point
  const pattern = /^(\d{1,2}):(\d{1,5})\/(\d{1,5})(?:\.(\d{1,3}))?$/;
  const match = trimmed.match(pattern);

  if (!match) {
    return {
      valid: false,
      error: 'Неверный формат адреса. Ожидается: Z:NNNN/NNN или Z:NNNN/NNN.PP',
    };
  }

  const [, zone, net, node, point] = match;

  // Validate ranges
  if (parseInt(zone) > 6) {
    return { valid: false, error: 'Зона должна быть от 1 до 6' };
  }
  if (parseInt(net) > 32767) {
    return { valid: false, error: 'Номер сети слишком большой' };
  }
  if (parseInt(node) > 32767) {
    return { valid: false, error: 'Номер ноды слишком большой' };
  }
  if (point && parseInt(point) > 255) {
    return { valid: false, error: 'Номер поинта должен быть от 0 до 255' };
  }

  return { valid: true, formatted: trimmed };
}

/**
 * Validates phone number format
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Телефон не может быть пустым' };
  }

  const trimmed = phone.trim();

  // Accept various phone formats
  if (trimmed.length < 7) {
    return { valid: false, error: 'Телефон слишком короткий' };
  }

  return { valid: true, formatted: trimmed };
}

/**
 * Validates DOS path format
 */
export function validatePath(path, fs = null) {
  if (!path || typeof path !== 'string') {
    return { valid: false, error: 'Путь не может быть пустым' };
  }

  const trimmed = path.trim().toUpperCase();

  // Check DOS path format C:\PATH\TO\DIR
  if (!trimmed.match(/^[A-Z]:\\.+$/)) {
    return {
      valid: false,
      error: 'Неверный формат пути. Ожидается: C:\\FIDO\\INBOUND',
    };
  }

  // If filesystem provided, check if path exists
  if (fs) {
    // Try to create directory if it doesn't exist
    const parts = trimmed.split('\\').filter(p => p);
    let currentPath = parts[0]; // C:

    for (let i = 1; i < parts.length; i++) {
      currentPath += '\\' + parts[i];
      const result = fs.ls(currentPath);

      if (!result.ok) {
        // Try to create the directory
        const mkdirResult = fs.createDir(currentPath);
        if (!mkdirResult.ok) {
          return {
            valid: false,
            error: `Невозможно создать каталог: ${currentPath}`,
          };
        }
      }
    }
  }

  return { valid: true, formatted: trimmed };
}

/**
 * Validates complete T-Mail configuration
 */
export function validateTMailConfig(config, fs = null) {
  const errors = [];

  // Validate address
  const addressResult = validateFidoAddress(config.address);
  if (!addressResult.valid) {
    errors.push(`FidoNet Address: ${addressResult.error}`);
  }

  // Validate boss address (must be node, not point)
  const bossResult = validateFidoAddress(config.bossAddress);
  if (!bossResult.valid) {
    errors.push(`Boss Address: ${bossResult.error}`);
  } else if (config.bossAddress.includes('.')) {
    errors.push('Boss Address: Босс-нода не может быть поинтом');
  }

  // Validate phone
  const phoneResult = validatePhone(config.bossPhone);
  if (!phoneResult.valid) {
    errors.push(`Boss Phone: ${phoneResult.error}`);
  }

  // Validate password
  if (!config.password || !config.password.trim()) {
    errors.push('Password: Пароль не может быть пустым');
  }

  // Validate paths
  const inboundResult = validatePath(config.inbound, fs);
  if (!inboundResult.valid) {
    errors.push(`Inbound: ${inboundResult.error}`);
  }

  const outboundResult = validatePath(config.outbound, fs);
  if (!outboundResult.valid) {
    errors.push(`Outbound: ${outboundResult.error}`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Checks if configuration matches the correct puzzle solution
 */
export function checkConfigCorrectness(config) {
  const issues = [];

  if (config.address !== CORRECT_VALUES.address) {
    issues.push({
      field: 'address',
      message: 'Адрес не совпадает с тем, что выдал Сисоп',
    });
  }

  if (config.bossAddress !== CORRECT_VALUES.bossAddress) {
    issues.push({
      field: 'bossAddress',
      message: 'Адрес босс-ноды указан неверно',
    });
  }

  if (config.password !== CORRECT_VALUES.password) {
    issues.push({
      field: 'password',
      message: 'Пароль неверный',
    });
  }

  if (config.bossPhone !== CORRECT_VALUES.bossPhone) {
    issues.push({
      field: 'bossPhone',
      message: 'Телефон босс-ноды указан неверно',
    });
  }

  if (issues.length > 0) {
    return { correct: false, issues };
  }

  return { correct: true };
}

/**
 * Generates T-Mail.ctl file content from config
 */
export function generateTMailConfig(config) {
  return `; T-Mail Configuration File
; Generated by T-Mail Configuration Editor

Address ${config.address}
Password ${config.password}
BossAddress ${config.bossAddress}
BossPhone ${config.bossPhone}
Inbound ${config.inbound}
Outbound ${config.outbound}

; End of configuration
`;
}
