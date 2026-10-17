import { describe, it } from 'node:test';
import assert from 'node:assert';
import { theme, colors, typography, spacing, radii, claymorphism } from '../index';

describe('Design Tokens', () => {
  it('should export all expected color tokens', () => {
    assert.strictEqual(colors.forest[800], '#1D4A25');
    assert.strictEqual(colors.forest[950], '#14351A');
    assert.strictEqual(colors.surface.paper, '#FDFBF7');
    assert.strictEqual(colors.surface.elevated, '#F5F0E7');
    assert.strictEqual(colors.ink.primary, '#20251F');
  });

  it('should configure EB Garamond and Barlow font families', () => {
    assert.ok(typography.fontFamilies.heading.includes('EB Garamond'));
    assert.ok(typography.fontFamilies.body.includes('Barlow'));
  });

  it('should define 4px incremental spacing scale', () => {
    assert.strictEqual(spacing[1], 4);
    assert.strictEqual(spacing[2], 8);
    assert.strictEqual(spacing[4], 16);
    assert.strictEqual(spacing[6], 24);
    assert.strictEqual(spacing[8], 32);
  });

  it('should match standard radii specifications', () => {
    assert.strictEqual(radii.control, 12);
    assert.strictEqual(radii.card, 20);
    assert.strictEqual(radii.panel, 28);
  });

  it('should provide claymorphic styles with elevation and highlights', () => {
    assert.ok(claymorphism.card.elevation > 0);
    assert.strictEqual(claymorphism.card.borderColor, '#FFFFFF');
    assert.ok(claymorphism.cardRaised.elevation > claymorphism.card.elevation);
  });

  it('should export cohesive theme object', () => {
    assert.ok(theme.colors);
    assert.ok(theme.typography);
    assert.ok(theme.spacing);
    assert.ok(theme.radii);
    assert.ok(theme.claymorphism);
  });
});

