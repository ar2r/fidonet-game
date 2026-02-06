import { describe, it, expect, vi } from 'vitest';
import {
    validateFidoAddress,
    validatePhone,
    validatePath,
    validateTMailConfig,
    checkConfigCorrectness,
    generateTMailConfig,
} from './configValidator';

describe('configValidator', () => {
    describe('validateFidoAddress', () => {
        it('validates correct node address', () => {
            const result = validateFidoAddress('2:5020/123');
            expect(result.valid).toBe(true);
            expect(result.formatted).toBe('2:5020/123');
        });

        it('validates correct point address', () => {
            const result = validateFidoAddress('2:5020/123.45');
            expect(result.valid).toBe(true);
            expect(result.formatted).toBe('2:5020/123.45');
        });

        it('rejects empty address', () => {
            const result = validateFidoAddress('');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('не может быть пустым');
        });

        it('rejects invalid format', () => {
            const result = validateFidoAddress('invalid');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Неверный формат');
        });

        it('rejects zone > 6', () => {
            const result = validateFidoAddress('7:5020/123');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Зона должна быть от 1 до 6');
        });

        it('trims whitespace', () => {
            const result = validateFidoAddress('  2:5020/123  ');
            expect(result.valid).toBe(true);
            expect(result.formatted).toBe('2:5020/123');
        });
    });

    describe('validatePhone', () => {
        it('validates correct phone number', () => {
            const result = validatePhone('555-3389');
            expect(result.valid).toBe(true);
            expect(result.formatted).toBe('555-3389');
        });

        it('validates various formats', () => {
            expect(validatePhone('1234567').valid).toBe(true);
            expect(validatePhone('123-456-7890').valid).toBe(true);
            expect(validatePhone('(555) 3389').valid).toBe(true);
        });

        it('rejects empty phone', () => {
            const result = validatePhone('');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('не может быть пустым');
        });

        it('rejects too short phone', () => {
            const result = validatePhone('123');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('слишком короткий');
        });
    });

    describe('validatePath', () => {
        it('validates correct DOS path', () => {
            const result = validatePath('C:\\FIDO\\INBOUND');
            expect(result.valid).toBe(true);
            expect(result.formatted).toBe('C:\\FIDO\\INBOUND');
        });

        it('rejects empty path', () => {
            const result = validatePath('');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('не может быть пустым');
        });

        it('rejects invalid DOS path format', () => {
            const result = validatePath('/unix/path');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Неверный формат пути');
        });

        it('converts to uppercase', () => {
            const result = validatePath('c:\\fido\\inbound');
            expect(result.valid).toBe(true);
            expect(result.formatted).toBe('C:\\FIDO\\INBOUND');
        });

        it('creates missing directories with filesystem', () => {
            const mockFs = {
                ls: vi.fn(() => ({ ok: false })),
                createDir: vi.fn(() => ({ ok: true })),
            };

            const result = validatePath('C:\\FIDO\\NEWDIR', mockFs);
            expect(result.valid).toBe(true);
            expect(mockFs.createDir).toHaveBeenCalled();
        });

        it('fails if cannot create directory', () => {
            const mockFs = {
                ls: vi.fn(() => ({ ok: false })),
                createDir: vi.fn(() => ({ ok: false, error: 'Access denied' })),
            };

            const result = validatePath('C:\\FIDO\\BADDIR', mockFs);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Невозможно создать каталог');
        });
    });

    describe('validateTMailConfig', () => {
        it('validates complete correct config', () => {
            const config = {
                address: '2:5020/123.45',
                bossAddress: '2:5020/123',
                bossPhone: '555-3389',
                password: 'NEXUS95',
                inbound: 'C:\\FIDO\\INBOUND',
                outbound: 'C:\\FIDO\\OUTBOUND',
            };

            const result = validateTMailConfig(config);
            expect(result.valid).toBe(true);
        });

        it('rejects boss address with point', () => {
            const config = {
                address: '2:5020/123.45',
                bossAddress: '2:5020/123.1', // Boss cannot be point
                bossPhone: '555-3389',
                password: 'NEXUS95',
                inbound: 'C:\\FIDO\\INBOUND',
                outbound: 'C:\\FIDO\\OUTBOUND',
            };

            const result = validateTMailConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors).toBeDefined();
            expect(result.errors.some(e => e.includes('поинт'))).toBe(true);
        });

        it('rejects empty password', () => {
            const config = {
                address: '2:5020/123.45',
                bossAddress: '2:5020/123',
                bossPhone: '555-3389',
                password: '',
                inbound: 'C:\\FIDO\\INBOUND',
                outbound: 'C:\\FIDO\\OUTBOUND',
            };

            const result = validateTMailConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('Пароль'))).toBe(true);
        });

        it('accumulates multiple errors', () => {
            const config = {
                address: 'invalid',
                bossAddress: 'invalid',
                bossPhone: '12',
                password: '',
                inbound: '/invalid',
                outbound: '/invalid',
            };

            const result = validateTMailConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(3);
        });
    });

    describe('checkConfigCorrectness', () => {
        it('accepts completely correct config', () => {
            const config = {
                address: '2:5020/123.45',
                bossAddress: '2:5020/123',
                bossPhone: '555-3389',
                password: 'NEXUS95',
            };

            const result = checkConfigCorrectness(config);
            expect(result.correct).toBe(true);
        });

        it('rejects incorrect address', () => {
            const config = {
                address: '2:5020/999.99',
                bossAddress: '2:5020/123',
                bossPhone: '555-3389',
                password: 'NEXUS95',
            };

            const result = checkConfigCorrectness(config);
            expect(result.correct).toBe(false);
            expect(result.issues).toBeDefined();
            expect(result.issues.some(i => i.field === 'address')).toBe(true);
        });

        it('rejects incorrect password', () => {
            const config = {
                address: '2:5020/123.45',
                bossAddress: '2:5020/123',
                bossPhone: '555-3389',
                password: 'WRONG',
            };

            const result = checkConfigCorrectness(config);
            expect(result.correct).toBe(false);
            expect(result.issues.some(i => i.field === 'password')).toBe(true);
        });

        it('rejects incorrect boss address', () => {
            const config = {
                address: '2:5020/123.45',
                bossAddress: '2:5020/999',
                bossPhone: '555-3389',
                password: 'NEXUS95',
            };

            const result = checkConfigCorrectness(config);
            expect(result.correct).toBe(false);
            expect(result.issues.some(i => i.field === 'bossAddress')).toBe(true);
        });

        it('rejects incorrect phone', () => {
            const config = {
                address: '2:5020/123.45',
                bossAddress: '2:5020/123',
                bossPhone: '999-9999',
                password: 'NEXUS95',
            };

            const result = checkConfigCorrectness(config);
            expect(result.correct).toBe(false);
            expect(result.issues.some(i => i.field === 'bossPhone')).toBe(true);
        });
    });

    describe('generateTMailConfig', () => {
        it('generates valid config file content', () => {
            const config = {
                address: '2:5020/123.45',
                bossAddress: '2:5020/123',
                bossPhone: '555-3389',
                password: 'NEXUS95',
                inbound: 'C:\\FIDO\\INBOUND',
                outbound: 'C:\\FIDO\\OUTBOUND',
            };

            const content = generateTMailConfig(config);

            expect(content).toContain('Address 2:5020/123.45');
            expect(content).toContain('Password NEXUS95');
            expect(content).toContain('BossAddress 2:5020/123');
            expect(content).toContain('BossPhone 555-3389');
            expect(content).toContain('Inbound C:\\FIDO\\INBOUND');
            expect(content).toContain('Outbound C:\\FIDO\\OUTBOUND');
        });

        it('includes header and footer comments', () => {
            const config = {
                address: '2:5020/123.45',
                bossAddress: '2:5020/123',
                bossPhone: '555-3389',
                password: 'NEXUS95',
                inbound: 'C:\\FIDO\\INBOUND',
                outbound: 'C:\\FIDO\\OUTBOUND',
            };

            const content = generateTMailConfig(config);

            expect(content).toContain('T-Mail Configuration');
            expect(content).toContain('End of configuration');
        });
    });
});
