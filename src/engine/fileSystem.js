// In-Memory DOS File System Simulation

export const initialFileSystem = {
    "C:": {
        type: "DIR",
        children: {
            "FIDO": {
                type: "DIR",
                children: {
                    "INBOUND": { type: "DIR", children: {} },
                    "OUTBOUND": { type: "DIR", children: {} }
                }
            },
            "GAMES": {
                type: "DIR",
                children: {
                    "DOOM.EXE": { type: "FILE", content: "[BINARY DATA CANNOT READ]" },
                    "TETRIS.COM": { type: "FILE", content: "..." }
                }
            },
            "AUTOEXEC.BAT": { type: "FILE", content: "@echo off\npath C:\\FIDO;C:\\GAMES\nprompt $p$g" },
            "CONFIG.SYS": { type: "FILE", content: "FILES=20\nBUFFERS=20" },
            "NOTE.TXT": { type: "FILE", content: "Не забудь позвонить на BBS в 2:00 ночи!" }
        }
    }
};

export class FileSystem {
    constructor(initialState = initialFileSystem) {
        this.root = JSON.parse(JSON.stringify(initialState));
        this.currentPath = ["C:"];
    }

    _normalizePath(pathStr) {
        // Convert forward slashes to backslashes, uppercase
        return pathStr.replace(/\//g, '\\').toUpperCase();
    }

    _splitPath(pathStr) {
        return pathStr.split('\\').filter(p => p !== '' && p !== '.');
    }

    _getNodeAtPath(parts) {
        if (parts.length === 0) return null;

        let node = this.root[parts[0]];
        if (!node) return null;

        for (let i = 1; i < parts.length; i++) {
            if (parts[i] === '..') {
                // Go up — we can't go above root
                // This is handled by the caller resolving '..'
                return null;
            }
            if (!node.children || !node.children[parts[i]]) {
                return null;
            }
            node = node.children[parts[i]];
        }
        return node;
    }

    resolvePath(pathStr) {
        const normalized = this._normalizePath(pathStr);
        let parts;

        if (normalized.match(/^[A-Z]:/)) {
            // Absolute path: C:\FIDO
            parts = this._splitPath(normalized);
        } else {
            // Relative path
            parts = [...this.currentPath, ...this._splitPath(normalized)];
        }

        // Resolve '..'
        const resolved = [];
        for (const part of parts) {
            if (part === '..') {
                if (resolved.length > 1) {
                    resolved.pop();
                }
            } else {
                resolved.push(part);
            }
        }

        return resolved;
    }

    pwd() {
        if (this.currentPath.length === 1) {
            return this.currentPath[0] + '\\';
        }
        return this.currentPath.join('\\');
    }

    promptPath() {
        return this.pwd() + '>';
    }

    cd(pathStr) {
        if (!pathStr || pathStr === '.') return { ok: true };

        const resolved = this.resolvePath(pathStr);
        const node = this._getNodeAtPath(resolved);

        if (!node) {
            return { ok: false, error: `Путь не найден: ${pathStr}` };
        }
        if (node.type !== 'DIR') {
            return { ok: false, error: `Не является каталогом: ${pathStr}` };
        }

        this.currentPath = resolved;
        return { ok: true };
    }

    ls(pathStr) {
        let resolved;
        if (pathStr) {
            resolved = this.resolvePath(pathStr);
        } else {
            resolved = [...this.currentPath];
        }

        const node = this._getNodeAtPath(resolved);
        if (!node) {
            return { ok: false, error: `Путь не найден` };
        }
        if (node.type !== 'DIR') {
            return { ok: false, error: `Не является каталогом` };
        }

        const entries = [];
        for (const [name, child] of Object.entries(node.children)) {
            entries.push({
                name,
                type: child.type,
                size: child.type === 'FILE' ? (child.content?.length || 0) : 0,
            });
        }
        return { ok: true, entries };
    }

    cat(pathStr) {
        const resolved = this.resolvePath(pathStr);
        const node = this._getNodeAtPath(resolved);

        if (!node) {
            return { ok: false, error: `Файл не найден: ${pathStr}` };
        }
        if (node.type !== 'FILE') {
            return { ok: false, error: `Не является файлом: ${pathStr}` };
        }

        return { ok: true, content: node.content };
    }

    createDir(pathStr) {
        const resolved = this.resolvePath(pathStr);
        const dirName = resolved[resolved.length - 1];
        const parentParts = resolved.slice(0, -1);
        const parentNode = this._getNodeAtPath(parentParts);

        if (!parentNode || parentNode.type !== 'DIR') {
            return { ok: false, error: `Родительский каталог не найден` };
        }
        if (parentNode.children[dirName]) {
            return { ok: false, error: `Уже существует: ${dirName}` };
        }

        parentNode.children[dirName] = { type: 'DIR', children: {} };
        return { ok: true };
    }

    createFile(pathStr, content = '') {
        const resolved = this.resolvePath(pathStr);
        const fileName = resolved[resolved.length - 1];
        const parentParts = resolved.slice(0, -1);
        const parentNode = this._getNodeAtPath(parentParts);

        if (!parentNode || parentNode.type !== 'DIR') {
            return { ok: false, error: `Каталог не найден` };
        }

        parentNode.children[fileName] = { type: 'FILE', content };
        return { ok: true };
    }

    writeFile(pathStr, content) {
        const resolved = this.resolvePath(pathStr);
        const node = this._getNodeAtPath(resolved);

        if (!node) {
            return this.createFile(pathStr, content);
        }
        if (node.type !== 'FILE') {
            return { ok: false, error: `Не является файлом: ${pathStr}` };
        }

        node.content = content;
        return { ok: true };
    }

    tree(pathStr, prefix = '') {
        let resolved;
        if (pathStr) {
            resolved = this.resolvePath(pathStr);
        } else {
            resolved = [...this.currentPath];
        }

        const node = this._getNodeAtPath(resolved);
        if (!node || node.type !== 'DIR') {
            return [];
        }

        const lines = [];
        const entries = Object.entries(node.children);
        entries.forEach(([name, child], i) => {
            const isLast = i === entries.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            const childPrefix = isLast ? '    ' : '│   ';

            if (child.type === 'DIR') {
                lines.push(`${prefix}${connector}${name}\\`);
                const subResolved = [...resolved, name];
                const subNode = this._getNodeAtPath(subResolved);
                if (subNode) {
                    const subEntries = Object.entries(subNode.children);
                    subEntries.forEach(([subName, subChild], j) => {
                        const subIsLast = j === subEntries.length - 1;
                        const subConnector = subIsLast ? '└── ' : '├── ';
                        lines.push(`${prefix}${childPrefix}${subConnector}${subName}${subChild.type === 'DIR' ? '\\' : ''}`);
                    });
                }
            } else {
                lines.push(`${prefix}${connector}${name}`);
            }
        });

        return lines;
    }
}
