import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface CodeSnippet {
    id: string;
    language: string;
    content: string;
    timestamp: number;
    version: number;
}

class CodeManager {
    private storagePath: string;
    private snippets: Map<string, CodeSnippet[]> = new Map();

    constructor(storagePath: string) {
        this.storagePath = storagePath;
        this.loadSnippets();
    }

    private generateId(): string {
        return crypto.randomBytes(16).toString('hex');
    }

    private loadSnippets(): void {
        try {
            const files = fs.readdirSync(this.storagePath);
            files.forEach(file => {
                try {
                    const content = fs.readFileSync(path.join(this.storagePath, file), 'utf8');
                    const snippets: CodeSnippet[] = JSON.parse(content);
                    this.snippets.set(file.replace('.json', ''), snippets);
                } catch (error) {
                    console.error(`Failed to read or parse ${file}:`, error);
                }
            });
        } catch (error) {
            console.error("Failed to load snippets directory: ", error);
        }
    }

    private saveSnippets(id: string): void {
        try {
            if (this.snippets.has(id)) {
                const filePath = path.join(this.storagePath, `${id}.json`);
                fs.writeFileSync(filePath, JSON.stringify(this.snippets.get(id)), 'utf8');
            }
        } catch (error) {
            console.error(`Failed to save snippets for id ${id}:`, error);
        }
    }

    public addSnippet(language: string, content: string): string {
        try {
            const id = this.generateId();
            const newSnippet: CodeSnippet = {
                id,
                language,
                content,
                timestamp: Date.now(),
                version: 1
            };
            this.snippets.set(id, [newSnippet]);
            this.saveSnippets(id);
            return id;
        } catch (error) {
            console.error("Failed to add snippet: ", error);
            return "";
        }
    }

    public updateSnippet(id: string, newContent: string): boolean {
        try {
            const snippetVersions = this.snippets.get(id);
            if (!snippetVersions) return false;
            const latestVersion = snippetVersions[snippetVersions.length - 1];

            const updatedSnippet: CodeSnippet = { ...latestVersion, content: newContent, version: latestVersion.version + 1, timestamp: Date.now() };
            snippetVersions.push(updatedSnippet);
            this.saveSnippets(id);

            return true;
        } catch (error) {
            console.error(`Failed to update snippet ${id}:`, error);
            return false;
        }
    }

    public fetchSnippet(id: string): CodeSnippet | null {
        try {
            const snippetVersions = this.snippets.get(id);
            if (!snippetVersions) return null;
            return snippetVersions[snippetVersions.length - 1];
        } catch (error) {
            console.error(`Failed to fetch snippet ${id}:`, error);
            return null;
        }
    }

    public fetchVersionHistory(id: string): CodeSnippet[] | null {
        try {
            return this.snippets.get(id) || null;
        } catch (error) {
            console.error(`Failed to fetch version history for ${id}:`, error);
            return null;
        }
    }

    public deleteSnippet(id: string): boolean {
        try {
            if (!this.snippets.has(id)) return false;
            this.snippets.delete(id);
            const filePath = path.join(this.storagePath, `${id}.json`);
            fs.unlinkSync(filePath);
            return true;
        } catch (error) {
            console.error(`Failed to delete snippet ${id}:`, error);
            return false;
        }
    }
}

const codeManager = new CodeManager('./snippets');
const snippetId = codeManager.addSnippet('typescript', 'console.log("Hello, World!")');
console.log(codeManager.fetchSnippet(snippetId));
codeManager.updateSnippet(snippetId, 'console.log("Hello, TypeScript!")');
console.log(codeManager.fetchVersionHistory(snippetId));