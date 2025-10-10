import { Request, Response, NextFunction } from 'express';

export const validateOnboarding = (req: Request, res: Response, next: NextFunction) => {
  const { name, dateOfBirth, gender, city, photos, interests, preferences } = req.body;

  // Validate required fields
  if (!name || !dateOfBirth || !gender || !city) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }

  // Validate name length
  if (name.length < 2 || name.length > 50) {
    return res.status(400).json({
      success: false,
      error: 'Name must be between 2 and 50 characters'
    });
  }

  // Validate age (must be 18+)
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  
  if (age < 18) {
    return res.status(400).json({
      success: false,
      error: 'You must be 18 or older'
    });
  }

  // Validate photos (minimum 2)
  if (!photos || photos.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Minimum 2 photos required'
    });
  }

  // Validate interests (minimum 1, maximum 5)
  if (!interests || interests.length < 1 || interests.length > 5) {
    return res.status(400).json({
      success: false,
      error: 'Select between 1 and 5 interests'
    });
  }

  // Validate preferences
  if (!preferences || !preferences.showMe || preferences.showMe.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Select at least one preference'
    });
  }

  next();
};

