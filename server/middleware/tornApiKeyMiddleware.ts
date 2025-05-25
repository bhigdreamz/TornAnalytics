/**
 * tornApiKeyMiddleware.ts - Middleware for direct API key access
 * This middleware allows the application to use the environment API key 
 * without requiring user login/authentication
 */
import { Request, Response, NextFunction } from 'express';

// Get API key from environment
const API_KEY = process.env.TORN_API_KEY || "";

/**
 * Middleware that attaches the environment API key to the request
 * for endpoints that should always use the environment API key
 */
export function attachEnvApiKey(req: Request, _res: Response, next: NextFunction) {
  // Add environment API key to request object
  (req as any).tornApiKey = API_KEY;
  console.log("Using API key for request:", API_KEY.substring(0, 4) + "...");
  next();
}

/**
 * Middleware that checks for either user authentication with API key
 * or falls back to the environment API key
 */
export function useApiKey(req: Request, res: Response, next: NextFunction) {
  // If user is authenticated and has an API key, use that
  if (req.isAuthenticated() && req.user && (req.user as any).apiKey) {
    (req as any).tornApiKey = (req.user as any).apiKey;
    return next();
  }
  
  // Otherwise use environment API key
  if (API_KEY) {
    (req as any).tornApiKey = API_KEY;
    console.log("Using environment API key:", API_KEY.substring(0, 4) + "...");
    return next();
  }
  
  // No API key available
  return res.status(401).json({ 
    message: "API key required. Please log in or configure TORN_API_KEY environment variable." 
  });
}