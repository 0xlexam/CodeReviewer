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

class SnippetManager {
    private snippetsStoragePath: string;
    private codeSnippets: Map<string, CodeSnippet[]> = new Map();

    constructor(snippetsStoragePath: string) {
        this.snippetsStoragePath = snippetsStoragePath;
        this.loadAllSnippets();
    }

    private generateUniqueId(): string {
        return crypto.randomBytes(16).toString('hex');
    }

    private loadAllSnippets(): void {
        try {
            const snippetFiles = fs.readdirSync(this.snippetsStoragePath);
            snippetFiles.forEach(file => {
                try {
                    const snippetContent = fs.readFileSync(path.join(this.snippetsStoragePath, file), 'utf8');
                    const snippets: CodeSnippet[] = JSON.parse(snippetContent);
                    this.codeSnippets.set(file.replace('.json', ''), snippets);
                } catch (error) {
                    console.error(`Failed to read or parse snippet file ${file}:`, error);
                }
            });
        } catch (error) {
            console.error("Failed to load snippet files: ", error);
        }
    }

    private persistSnippets(fileId: string): void {
        try {
            if (this.codeSnippets.has(fileId)) {
                const filePath = path.join(this.snippetsStoragePath, `${fileId}.json`);
                fs.writeFileSync(filePath, JSON.stringify(this.codeSnippets.get(fileId)), 'utf8');
            }
        } catch (error) {
            console.error(`Failed to save snippets for fileId ${fileId}:`, error);
        }
    }

    public addNewSnippet(language: string, content: string): string {
        try {
            const snippetId = this.generateUniqueId();
            const newSnippet: CodeSnippet = {
                id: snippetId,
                language,
                content,
                timestamp: Date.now(),
                version: 1
            };
            this.codeSnippets.set(snippetId, [newSnippet]);
            this.persistSnippets(snippetId);
            return snippetId;
        } catch (error) {
            console.error("Failed to add new snippet: ", error);
            return "";
        }
    }

    public updateExistingSnippet(snippetId: string, updatedContent: string): boolean {
        try {
            const existingSnippetVersions = this.codeSnippets.get(snippetId);
            if (!existingSnippetVersions) return false;
            const latestVersion = existingSnippetVersions[existingSnippetVersions.length - 1];

            const updatedSnippet: CodeSnippet = { ...latestVersion, content: updatedContent, version: latestVersion.version + 1, timestamp: Date.now() };
            existingSnippetVersions.push(updatedSnippet);
            this.persistSnippets(snippetId);

            return true;
        } catch (error) {
            console.error(`Failed to update snippet ${snippetId}:`, error);
            return false;
        }
    }

    public retrieveLatestSnippet(snippetId: string): CodeSnippet | null {
        try {
            const snippetVersions = this.codeSnippets.get(snippetId);
            if (!snippetVersions) return null;
            return snippetVersions[snippetVersions.length - 1];
        } catch (error) {
            console.error(`Failed to retrieve latest snippet ${snippetId}:`, error);
            return null;
        }
    }

    public retrieveSnippetHistory(snippetId: string): CodeSnippet[] | null {
        try {
            return this.codeSnippets.get(snippetId) || null;
        } catch (error) {
            console.error(`Failed to retrieve snippet history for ${snippetId}:`, error);
            return null;
        }
    }

    public removeSnippet(snippetId: string): boolean {
        try {
            if (!this.codeSnippets.has(snippetId)) return false;
            this.codeSnippets.delete(snippetId);
            const filePath = path.join(this.snippetsStoragePath, `${snippetId}.json`);
            fs.unlinkSync(filePath);
            return true;
        } catch (error) {
            console.error(`Failed to remove snippet ${snippetId}:`, error);
            return false;
        }
    }
}

const snippetManager = new SnippetManager('./snippets');
const newSnippetId = snippetManager.addNewSnippet('typescript', 'console.log("Hello, World!")');
console.log(snippetManager.retrieveLatestSnippet(newSnippetId));
snippetManager.updateExistingSnippet(newSnippetId, 'console.log("Hello, TypeScript!")');
console.log(snippetManager.retrieveSnippetHistory(newSnippetId));