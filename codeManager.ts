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
    }

    public updateSnippet(id: string, newContent: string): boolean {
        const snippetVersions = this.snippets.get(id);
        if (!snippetVersions) return false;
        const latestVersion = snippetVersions[snippetVersions.length - 1];

        const updatedSnippet: CodeSnippet = { ...latestVersion, content: newContent, version: latestVersion.version + 1, timestamp: Date.now() };
        snippetVersions.push(updatedSnippet);
        this.saveSnippets(id);

        return true;
    }

    public fetchSnippet(id: string): CodeSnippet | null {
        const snippetVersions = this.snippets.get(id);
        if (!snippetVersions) return null;
        return snippetVersions[snippetVersions.length - 1];
    }

    public fetchVersionHistory(id: string): CodeSnippet[] | null {
        return this.snippets.get(id) || null;
    }

    public deleteSnippet(id: string): boolean {
        if (!this.snippets.has(id)) return false;
        try {
            this.snippets.delete(id);
            const filePath = path.join(this.storagePath, `${id}.json`);
            fs.unlinkSync(filePath);
        } catch (error) {
            console.error(`Failed to delete snippet ${id}:`, error);
            return false;
        }
        return true;
    }
}

const codeManager = new CodeManager('./snippets');
const snippetId = codeManager.addSnippet('typescript', 'console.log("Hello, World!")');
console.log(codeManager.fetchSnippet(snippetId));
codeManager.updateSnippet(snippetId, 'console.log("Hello, TypeScript!")');
console.log(codeManager.fetchVersionHistory(snippetId));