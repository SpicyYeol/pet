#!/usr/bin/env python3
"""
Generate a clean, professional single-page flowchart for the entire Pet rPPG pipeline.
This will serve as 'the one' overall algorithm flow chart for presentations.
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np
from pathlib import Path

OUTPUT_PATH = Path("reports/rppg_pet_keypoints/overall_algorithm_flowchart.png")

# Stages (8 main stages, refined for clarity)
stages = [
    ("1. 입력 및 전처리", "Video + YOLO (선택)"),
    ("2. 키포인트 검출", "DLC SuperAnimal Quadruped"),
    ("3. Dual Candidate 생성", "Single vs Multi-Patch (per zone)"),
    ("4. A+B 전처리", "Panting 제거 + 심박 증폭"),
    ("5. Adaptive ROI Selector", "Per-zone 품질 기반 선택"),
    ("6. rPPG 신호 추출", "dog_learned 포함 7개 방법"),
    ("7. Rejection & Scoring", "Pixel stability + 기존 필터"),
    ("8. Smart Final Selection", "최종 BPM + Confidence")
]

def create_flowchart():
    plt.rcParams['font.family'] = 'Malgun Gothic'
    fig, ax = plt.subplots(figsize=(12, 14))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 14)
    ax.axis('off')

    # Title
    ax.text(6, 13.5, "강아지 rPPG 전체 알고리즘 플로우", 
            fontsize=20, fontweight='bold', ha='center', va='center',
            color='#1E3A5F')

    ax.text(6, 13.0, "Adaptive Multi-ROI + Dog-specific Signal Model", 
            fontsize=12, ha='center', va='center', color='#555555')

    # Colors
    box_color = '#E8F4F8'
    border_color = '#1E3A5F'
    text_color = '#1E3A5F'
    arrow_color = '#E85D04'

    y_positions = np.linspace(12.0, 1.5, len(stages))

    for i, (title, desc) in enumerate(stages):
        y = y_positions[i]
        
        # Main box
        box = FancyBboxPatch((1.5, y - 0.45), 9, 0.9,
                             boxstyle="round,pad=0.03,rounding_size=0.15",
                             facecolor=box_color, edgecolor=border_color, linewidth=2)
        ax.add_patch(box)
        
        # Stage title
        ax.text(6, y + 0.12, title, fontsize=11, fontweight='bold', 
                ha='center', va='center', color=text_color)
        
        # Description
        ax.text(6, y - 0.2, desc, fontsize=9, ha='center', va='center', color='#444444')

        # Arrow to next stage
        if i < len(stages) - 1:
            ax.annotate('', xy=(6, y_positions[i+1] + 0.45), 
                        xytext=(6, y - 0.45),
                        arrowprops=dict(arrowstyle='->', color=arrow_color, lw=2))

    # Side annotations for key innovations
    ax.annotate('Adaptive\nSelector', xy=(10.8, y_positions[4]), 
                fontsize=9, ha='center', va='center',
                bbox=dict(boxstyle='round', facecolor='#FFF3E0', edgecolor='#E85D04', alpha=0.9))
    
    ax.annotate('Dog-specific\nModel', xy=(1.2, y_positions[5]), 
                fontsize=9, ha='center', va='center',
                bbox=dict(boxstyle='round', facecolor='#E8F5E9', edgecolor='#2E7D32', alpha=0.9))

    # Footer
    ax.text(6, 0.6, "8단계 End-to-End Pipeline | Single View | Real-time Capable", 
            fontsize=9, ha='center', va='center', style='italic', color='#888888')

    plt.tight_layout()
    plt.savefig(OUTPUT_PATH, dpi=200, bbox_inches='tight', facecolor='white')
    print(f"Flowchart saved to: {OUTPUT_PATH}")

if __name__ == "__main__":
    create_flowchart()
