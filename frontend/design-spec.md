{
  "meta": {
    "project": "CKBind",
    "style": " web3 inspired UI",
    "design_language": [
      "Minimal",
      "High contrast",
      "Soft neon glow",
      "Rounded premium surfaces",
      "Dark immersive canvas",
      "Glassmorphism influences"
    ],
    "mood": [
      "Premium",
      "Confident",
      "Innovative",
      "Elegant",
      "Technical"
    ]
  },

  "layout": {
    "type": "Single-screen hero dashboard",
    "structure": {
      "outer_background": "Full viewport dark canvas",
      "main_container": "Centered floating panel with large radius",
      "content_split": {
        "left": "Marketing copy + CTA",
        "right": "3D abstract visual composition"
      }
    },

    "container": {
      "max_width": "1320px",
      "min_height": "920px",
      "padding": {
        "desktop": "40px",
        "tablet": "28px",
        "mobile": "20px"
      },
      "radius": "40px",
      "border": "1px subtle translucent border",
      "overflow": "hidden",
      "position": "relative"
    },

    "responsive_breakpoints": {
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px",
      "2xl": "1536px"
    },

    "responsive_behavior": {
      "2xl": {
        "layout": "Two-column hero",
        "visual_priority": "Balanced"
      },

      "xl": {
        "layout": "Two-column hero",
        "visual_scale": "Slightly reduced"
      },

      "lg": {
        "layout": "Two-column hero",
        "left_column_width": "45%",
        "right_column_width": "55%"
      },

      "md": {
        "layout": "Stacked vertical",
        "hero_visual": "Moves below text",
        "nav": "Compressed spacing"
      },

      "sm": {
        "layout": "Single column mobile",
        "cta": "Full width",
        "navigation": "Hamburger/menu drawer",
        "hero_visual": "Reduced scale"
      }
    }
  },

  "spacing_system": {
    "base_unit": 4,
    "recommended_scale": [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96]
  },

  "typography": {
    "font_style": "Modern geometric sans-serif",
    "weights": {
      "light": 300,
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },

    "hero_heading": {
      "desktop": {
        "size": "72px",
        "line_height": "0.98",
        "weight": 500,
        "tracking": "-0.04em"
      },
      "tablet": {
        "size": "56px"
      },
      "mobile": {
        "size": "40px"
      }
    },

    "body_text": {
      "desktop": {
        "size": "18px",
        "line_height": "1.7"
      },
      "mobile": {
        "size": "16px"
      }
    },

    "nav_text": {
      "size": "15px",
      "weight": 500
    },

    "button_text": {
      "size": "15px",
      "weight": 600
    }
  },

  "color_system": {
    "primary_palette": {
      "50": "#F5F0FF",
      "100": "#E9D8FF",
      "200": "#D4B5FF",
      "300": "#BB86FC",
      "400": "#A855F7",
      "500": "#9333EA",
      "600": "#7E22CE",
      "700": "#6B21A8",
      "800": "#581C87",
      "900": "#3B0764"
    },

    "secondary_palette": {
      "50": "#FFF1F5",
      "100": "#FFE4EC",
      "200": "#FFC7D8",
      "300": "#FF9DBD",
      "400": "#FF70A6",
      "500": "#F54291",
      "600": "#E11D74",
      "700": "#BE185D",
      "800": "#9D174D",
      "900": "#831843"
    },

    "neutral_palette": {
      "white": "#FFFFFF",
      "50": "#FAFAFA",
      "100": "#F4F4F5",
      "200": "#E4E4E7",
      "300": "#D4D4D8",
      "400": "#A1A1AA",
      "500": "#71717A",
      "600": "#52525B",
      "700": "#3F3F46",
      "800": "#27272A",
      "900": "#18181B",
      "950": "#09090B"
    },

    "dark_mode": {
      "background": "#05010F",
      "surface": "#0B0B14",
      "surface_secondary": "#11111C",
      "border": "rgba(255,255,255,0.08)",
      "text_primary": "#FFFFFF",
      "text_secondary": "#B4B4C7",
      "text_muted": "#8C8CA3"
    },

    "light_mode": {
      "background": "#F7F7FB",
      "surface": "#FFFFFF",
      "surface_secondary": "#F3F3F8",
      "border": "rgba(0,0,0,0.08)",
      "text_primary": "#09090B",
      "text_secondary": "#52525B",
      "text_muted": "#71717A"
    },

    "accent_colors": {
      "electric_purple": "#A855F7",
      "neon_magenta": "#EC4899",
      "deep_violet": "#6D28D9",
      "cyan_glow": "#22D3EE",
      "warm_orange": "#FB923C",
      "highlight_white": "#FDFDFD"
    }
  },

  "backgrounds": {
    "dark_mode": {
      "base": "Near-black radial blend",
      "overlay_glow": [
        "Purple radial glow from right side",
        "Magenta bloom at lower-right",
        "Soft blue/purple ambient gradient"
      ],
      "texture": "Extremely subtle noise/grain"
    },

    "light_mode": {
      "base": "Soft off-white",
      "overlay_glow": [
        "Faint purple blur",
        "Pink ambient bloom",
        "Soft glass reflections"
      ]
    }
  },

  "navigation": {
    "height": "72px",
    "layout": {
      "left": "Logo",
      "center": "Navigation links",
      "right": "Auth actions"
    },

    "logo": {
      "style": "Minimal geometric mark",
      "size": "36px"
    },

    "nav_links": {
      "gap": "48px",
      "items": [
        "Home",
        "Solutions",
        "Pricing",
        "Resources"
      ]
    },

    "auth_buttons": {
      "login": {
        "style": "Text button"
      },
      "signup": {
        "style": "Ghost bordered pill button"
      }
    }
  },

  "hero_section": {
    "layout": {
      "desktop": "Split 45/55",
      "mobile": "Vertical stack"
    },

    "announcement_badge": {
      "style": "Pill chip",
      "height": "44px",
      "radius": "999px",
      "background": "Glass dark surface",
      "border": "Subtle white transparency",
      "segments": {
        "tag": "White pill",
        "text": "Muted white text"
      }
    },

    "headline": {
      "max_width": "520px",
      "gradient_text": {
        "enabled": true,
        "colors": [
          "#F5D0FE",
          "#FFFFFF"
        ]
      }
    },

    "description": {
      "max_width": "420px",
      "opacity": 0.8
    },

    "cta": {
      "primary_button": {
        "height": "60px",
        "padding_x": "28px",
        "radius": "999px",
        "background": "Pink-purple gradient",
        "text_color": "#09090B",
        "shadow": "Soft magenta glow"
      },

      "icon_circle": {
        "size": "52px",
        "background": "#FFFFFF",
        "icon": "Arrow up-right",
        "position": "Attached to right side of CTA"
      }
    }
  },

  "3d_visual_system": {
    "description": "Floating futuristic metallic cubes arranged in cross-like composition",

    "composition": {
      "object_count": 4,
      "layout": "Diamond/cross structure",
      "rotation": "Isometric perspective",
      "depth": "Strong depth layering"
    },

    "material": {
      "surface": "Glossy metallic",
      "reflection": "Strong edge reflections",
      "roughness": "Low-medium",
      "emission": "Subtle neon edge glow"
    },

    "lighting": {
      "key_light": "Top-right warm light",
      "rim_light": "Purple neon rim",
      "ambient": "Soft violet bounce"
    },

    "surface_details": {
      "micro_texture": "Perforated dot matrix",
      "gradient_faces": [
        "Black to magenta",
        "White to peach",
        "Purple to blue"
      ]
    },

    "effects": {
      "chromatic_aberration": "Subtle",
      "bloom": "Soft neon bloom",
      "shadow": "Large blurred shadow beneath objects"
    }
  },

  "buttons": {
    "radius": "999px",

    "primary": {
      "background": "Linear gradient purple → pink",
      "hover": {
        "brightness": "+8%",
        "shadow_intensity": "+20%"
      }
    },

    "secondary": {
      "background": "Transparent",
      "border": "1px translucent",
      "hover": {
        "background": "rgba(255,255,255,0.05)"
      }
    }
  },

  "cards_and_surfaces": {
    "radius_scale": {
      "sm": "12px",
      "md": "20px",
      "lg": "28px",
      "xl": "40px"
    },

    "glass_surface": {
      "background": "rgba(255,255,255,0.04)",
      "backdrop_blur": "20px",
      "border": "1px solid rgba(255,255,255,0.08)"
    }
  },

  "shadows_and_glows": {
    "ambient_shadow": "0 20px 80px rgba(0,0,0,0.45)",
    "purple_glow": "0 0 120px rgba(168,85,247,0.35)",
    "pink_glow": "0 0 90px rgba(236,72,153,0.25)",
    "button_glow": "0 8px 40px rgba(236,72,153,0.4)"
  },

  "motion": {
    "style": "Smooth premium transitions",
    "duration": {
      "fast": "150ms",
      "normal": "250ms",
      "slow": "500ms"
    },

    "easing": "cubic-bezier(0.4, 0, 0.2, 1)",

    "recommended_animations": [
      "Soft hover elevation",
      "Gradient drift",
      "Glow pulse",
      "Floating 3D object motion",
      "Button scale on hover",
      "Fade-slide content entrance"
    ]
  },

  "iconography": {
    "style": "Thin minimal icons",
    "stroke_width": "1.5px",
    "corner_style": "Rounded"
  },

  "accessibility": {
    "contrast": "Maintain WCAG AA contrast",
    "focus_states": "Visible purple glow focus ring",
    "minimum_touch_target": "44px",
    "text_scaling": "Preserve layout up to 200%"
  },

  "implementation_prompt": "```md\nCreate a premium futuristic fintech landing dashboard with a dark immersive atmosphere and elegant neon gradients. The interface should feel minimal, spacious, and high-end.\n\nUse only the defined token system:\n- Primary palette for all main interactions and glows.\n- Secondary palette for highlights, CTA gradients, and emphasis.\n- Neutral grays for surfaces, typography, and borders.\n- Accent colors only for advanced visual effects such as 3D media, gradients, glows, and shadows.\n\nThe UI should prioritize:\n- Large rounded surfaces\n- Soft glassmorphism\n- High contrast typography\n- Spacious layout hierarchy\n- Smooth ambient lighting\n- Subtle futuristic glow effects\n- Floating premium 3D visuals\n\nThe layout must adapt cleanly from large desktop hero layouts into stacked mobile layouts while preserving visual balance and spacing rhythm.\n\nAll interactions should feel soft, polished, and cinematic rather than aggressive. Hover states should increase glow, elevation, and brightness subtly.\n\nMaintain a minimal visual hierarchy:\n- One dominant hero message\n- One primary CTA\n- One supporting navigation system\n- One signature visual composition\n\nAvoid clutter, hard borders, sharp corners, or saturated rainbow palettes. Keep the design restrained, elegant, and premium.\n```"
}