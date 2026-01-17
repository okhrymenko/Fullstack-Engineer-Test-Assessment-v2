import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { SportsArticle } from '../entity/SportsArticle';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

interface CSVRow {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  imageUrl?: string;
}

async function seed() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('Database connection established');

    const articleRepository = AppDataSource.getRepository(SportsArticle);

    // Check if articles already exist
    const existingCount = await articleRepository.count();
    if (existingCount > 0) {
      console.log(`Database already contains ${existingCount} articles. Skipping seed.`);
      console.log('To re-seed, please clear the database first.');
      await AppDataSource.destroy();
      process.exit(0);
    }

    // Read CSV file
    const csvPath = process.argv[2] || path.join(__dirname, '../../sports-articles.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found at: ${csvPath}`);
      console.log('Usage: pnpm seed [path-to-csv-file]');
      await AppDataSource.destroy();
      process.exit(1);
    }

    console.log(`Reading CSV file from: ${csvPath}`);
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    // Parse CSV
    const records: CSVRow[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`Found ${records.length} articles to import`);

    // Create articles
    const articles = records.map((row) => {
      const article = new SportsArticle();
      article.title = row.title;
      article.content = row.content;
      article.imageUrl = row.imageUrl || undefined;
      
      // Parse date string (format: YYYY-MM-DD)
      if (row.createdAt) {
        article.createdAt = new Date(row.createdAt);
      }

      return article;
    });

    // Save to database
    console.log('Saving articles to database...');
    await articleRepository.save(articles);

    console.log(`✅ Successfully seeded ${articles.length} articles!`);
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

seed();
