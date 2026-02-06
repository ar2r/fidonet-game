// Basic In-Memory File System Simulation

export const initialFileSystem = {
    "C:": {
        type: "DIR",
        children: {
            "FIDO": {
                type: "DIR",
                children: {
                    "T-MAIL.CTL": { type: "FILE", content: "address 2:5020/123.45\npassword secret" },
                    "GOLDED.CFG": { type: "FILE", content: "username \"SysOp\"\ncolor scheme blue" },
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
            "NOTE.TXT": { type: "FILE", content: "Remember to call BBS at 2:00 AM!" }
        }
    }
};

export class FileSystem {
    constructor(initialState = initialFileSystem) {
        this.root = JSON.parse(JSON.stringify(initialState));
        this.currentPath = ["C:"];
    }

    resolvePath(pathStr) {
        // Simplified path resolution
        if (pathStr === "C:" || pathStr === "/") return this.root["C:"];

        let path = [...this.currentPath];
        if (pathStr.startsWith("C:")) {
            path = ["C:"];
            pathStr = pathStr.substring(2);
        }

        const parts = pathStr.split("\\").filter(p => p !== "" && p !== ".");

        // Traverse (Read-Only for now logic)
        // This is a placeholder for full path traversal logic
        // For game prototype, we assume simple relative paths usually

        return null; // TODO: Implement full traversal
    }

    ls(absolutePath = null) {
        // Mock LS for current directory C:\
        if (this.currentPath.length === 1 && this.currentPath[0] === "C:") {
            return this.root["C:"].children;
        }
        return {};
    }
}
