export interface PerformanceMetrics {
  timestamp: Date;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  successRate: number;
  errorRate: number;
  activeConnections: number;
  queueSize: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    memory: boolean;
    cpu: boolean;
    responseTime: boolean;
    errorRate: boolean;
  };
  metrics: PerformanceMetrics;
  recommendations: string[];
}

export class MonitoringService {
  private metrics: PerformanceMetrics[] = [];
  private thresholds = {
    responseTime: 5000, // ms
    memoryUsage: 0.8, // 80%
    cpuUsage: 0.7, // 70%
    errorRate: 0.1, // 10%
  };

  recordMetrics(metrics: Omit<PerformanceMetrics, 'timestamp'>): void {
    const fullMetrics: PerformanceMetrics = {
      ...metrics,
      timestamp: new Date(),
    };

    this.metrics.push(fullMetrics);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  getHealthStatus(): HealthStatus {
    const recentMetrics = this.metrics.slice(-10); // Last 10 metrics
    const latest = recentMetrics[recentMetrics.length - 1];

    if (!latest) {
      return {
        status: 'healthy',
        checks: {
          memory: true,
          cpu: true,
          responseTime: true,
          errorRate: true,
        },
        metrics: this.getEmptyMetrics(),
        recommendations: [],
      };
    }

    const checks = {
      memory: latest.memoryUsage < this.thresholds.memoryUsage,
      cpu: latest.cpuUsage < this.thresholds.cpuUsage,
      responseTime: latest.responseTime < this.thresholds.responseTime,
      errorRate: latest.errorRate < this.thresholds.errorRate,
    };

    const failedChecks = Object.entries(checks).filter(([_, passed]) => !passed);
    const status = failedChecks.length === 0 ? 'healthy' : 
                   failedChecks.length <= 2 ? 'degraded' : 'unhealthy';

    const recommendations = this.generateRecommendations(checks, latest);

    return {
      status,
      checks,
      metrics: latest,
      recommendations,
    };
  }

  private generateRecommendations(checks: any, metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];

    if (!checks.memory) {
      recommendations.push('High memory usage detected. Consider clearing cache or optimizing memory usage.');
    }

    if (!checks.cpu) {
      recommendations.push('High CPU usage detected. Consider optimizing algorithms or reducing concurrent operations.');
    }

    if (!checks.responseTime) {
      recommendations.push('Slow response times detected. Consider optimizing code or increasing resources.');
    }

    if (!checks.errorRate) {
      recommendations.push('High error rate detected. Review error logs and improve error handling.');
    }

    if (recommendations.length === 0) {
      recommendations.push('System is performing well. Continue monitoring.');
    }

    return recommendations;
  }

  getMetricsHistory(minutes: number = 60): PerformanceMetrics[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.metrics.filter(metric => metric.timestamp >= cutoff);
  }

  getAggregatedMetrics(minutes: number = 60): {
    avgResponseTime: number;
    avgMemoryUsage: number;
    avgCpuUsage: number;
    avgErrorRate: number;
    totalRequests: number;
  } {
    const relevantMetrics = this.getMetricsHistory(minutes);
    
    if (relevantMetrics.length === 0) {
      return {
        avgResponseTime: 0,
        avgMemoryUsage: 0,
        avgCpuUsage: 0,
        avgErrorRate: 0,
        totalRequests: 0,
      };
    }

    const sum = relevantMetrics.reduce((acc, metric) => ({
      responseTime: acc.responseTime + metric.responseTime,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      cpuUsage: acc.cpuUsage + metric.cpuUsage,
      errorRate: acc.errorRate + metric.errorRate,
    }), {
      responseTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      errorRate: 0,
    });

    const count = relevantMetrics.length;

    return {
      avgResponseTime: sum.responseTime / count,
      avgMemoryUsage: sum.memoryUsage / count,
      avgCpuUsage: sum.cpuUsage / count,
      avgErrorRate: sum.errorRate / count,
      totalRequests: count,
    };
  }

  getPerformanceTrend(minutes: number = 60): 'improving' | 'stable' | 'degrading' {
    const relevantMetrics = this.getMetricsHistory(minutes);
    
    if (relevantMetrics.length < 2) {
      return 'stable';
    }

    const firstHalf = relevantMetrics.slice(0, Math.floor(relevantMetrics.length / 2));
    const secondHalf = relevantMetrics.slice(Math.floor(relevantMetrics.length / 2));

    const firstAvg = this.calculateAverage(firstHalf);
    const secondAvg = this.calculateAverage(secondHalf);

    const threshold = 0.1; // 10% change threshold

    if (secondAvg.responseTime < firstAvg.responseTime * (1 - threshold) &&
        secondAvg.errorRate < firstAvg.errorRate * (1 - threshold)) {
      return 'improving';
    } else if (secondAvg.responseTime > firstAvg.responseTime * (1 + threshold) ||
               secondAvg.errorRate > firstAvg.errorRate * (1 + threshold)) {
      return 'degrading';
    }

    return 'stable';
  }

  private calculateAverage(metrics: PerformanceMetrics[]): {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    errorRate: number;
  } {
    if (metrics.length === 0) {
      return { responseTime: 0, memoryUsage: 0, cpuUsage: 0, errorRate: 0 };
    }

    const sum = metrics.reduce((acc, metric) => ({
      responseTime: acc.responseTime + metric.responseTime,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      cpuUsage: acc.cpuUsage + metric.cpuUsage,
      errorRate: acc.errorRate + metric.errorRate,
    }), {
      responseTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      errorRate: 0,
    });

    const count = metrics.length;

    return {
      responseTime: sum.responseTime / count,
      memoryUsage: sum.memoryUsage / count,
      cpuUsage: sum.cpuUsage / count,
      errorRate: sum.errorRate / count,
    };
  }

  private getEmptyMetrics(): PerformanceMetrics {
    return {
      timestamp: new Date(),
      responseTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      successRate: 0,
      errorRate: 0,
      activeConnections: 0,
      queueSize: 0,
    };
  }

  updateThresholds(newThresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      thresholds: this.thresholds,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}