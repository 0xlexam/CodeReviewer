import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

interface Submission {
  id: string;
  code: string;
  language: string;
}

interface Comment {
  id: string;
  submissionId: string;
  content: string;
}

interface ReviewSession {
  id: string;
  submissionId: string;
  status: 'OPEN' | 'CLOSED';
}

let submissions: Map<string, Submission> = new Map();
let comments: Map<string, Comment[]> = new Map();
let reviewSessions: Map<string, ReviewSession[]> = new Map();

app.post('/api/submissions', (req: Request, res: Response) => {
  try {
    const submission: Submission = req.body;
    if (!submission.id || !submission.code || !submission.language) {
      throw new Error('Missing field(s) in the submission');
    }
    submissions.set(submission.id, submission);
    res.status(201).send(submission);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.get('/api/submissions', (req: Request, res: Response) => {
  try {
    res.status(200).send(Array.from(submissions.values()));
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch submissions' });
  }
});

app.post('/api/comments', (req: Request, res: Response) => {
  try {
    const comment: Comment = req.body;
    if (!comment.id || !comment.submissionId || !comment.content) {
      throw new Error('Missing field(s) in the comment');
    }
    const submissionComments = comments.get(comment.submissionId) || [];
    submissionComments.push(comment);
    comments.set(comment.submissionId, submissionComments);
    res.status(201).send(comment);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.get('/api/comments/:submissionId', (req: Request, res: Response) => {
  try {
    const submissionId = req.params.submissionId;
    const submissionComments = comments.get(submissionId) || [];
    res.status(200).send(submissionComments);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch comments' });
  }
});

app.post('/api/reviewSessions', (req: Request, res: Response) => {
  try {
    const reviewSession: ReviewSession = req.body;
    if (!reviewSession.id || !reviewSession.submissionId || !reviewSession.status) {
      throw new Error('Missing field(s) in the review session');
    }
    const submissionReviewSessions = reviewSessions.get(reviewSession.submissionId) || [];
    submissionReviewSessions.push(reviewSession);
    reviewSessions.set(reviewSession.submissionId, submissionReviewSessions);
    res.status(201).send(reviewSession);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.get('/api/reviewSessions', (req: Request, res: Response) => {
  try {
    const allSessions = Array.from(reviewSessions.values()).flat();
    res.status(200).send(allSessions);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch review sessions' });
  }
});

app.get('/api/reviewSessions/:submissionId', (req: Request, res: Response) => {
  try {
    const submissionId = req.params.submissionId;
    const submissionReviewSessions = reviewSessions.get(submissionId) || [];
    res.status(200).send(submissionReviewSessions);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch review sessions for the given submission' });
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});