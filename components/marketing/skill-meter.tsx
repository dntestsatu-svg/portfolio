import type { SkillMetric } from "@/lib/portfolio-data";

type SkillMeterProps = {
  skill: SkillMetric;
};

export function SkillMeter({ skill }: SkillMeterProps) {
  return (
    <article className="surface-panel rounded-3xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{skill.name}</h3>
          <p className="copy-muted mt-2 text-sm">{skill.description}</p>
        </div>
        <span className="font-mono text-sm text-(--color-accent)">{skill.level}%</span>
      </div>

      <progress
        className="skill-progress mt-5 h-3 w-full overflow-hidden rounded-full"
        max={100}
        value={skill.level}
      >
        {skill.level}%
      </progress>
    </article>
  );
}

