"""
Chart data generator for AI responses
"""
from typing import Dict, Any, List, Optional


class ChartGenerator:
    """Generate chart configurations from query results"""
    
    def determine_chart_type(self, question: str, data: List[Dict]) -> str:
        """
        Determine appropriate chart type based on question and data
        
        Args:
            question: User's question
            data: Query results
            
        Returns:
            Chart type: 'bar', 'pie', 'line', 'scatter', 'table'
        """
        question_lower = question.lower()
        
        # Check data structure
        if not data or len(data) == 0:
            return 'table'
        
        num_rows = len(data)
        num_cols = len(data[0].keys()) if data else 0
        
        # Comparison keywords → Bar chart
        if any(word in question_lower for word in ['compare', 'ranking', 'top', 'worst', 'best']):
            return 'bar'
        
        # Distribution keywords → Pie chart
        if any(word in question_lower for word in ['distribution', 'breakdown', 'percentage', 'proportion']):
            if num_rows <= 10:  # Pie charts work best with few categories
                return 'pie'
        
        # Trend keywords → Line chart
        if any(word in question_lower for word in ['trend', 'over time', 'monthly', 'temporal']):
            return 'line'
        
        # Correlation keywords → Scatter plot
        if any(word in question_lower for word in ['correlation', 'relationship', 'vs']):
            return 'scatter'
        
        # Default: Bar for small datasets, table for large
        if num_rows <= 20:
            return 'bar'
        else:
            return 'table'
    
    def format_for_chart(self, data: List[Dict], chart_type: str) -> Optional[Dict[str, Any]]:
        """
        Format query results for Chart.js/Plotly
        
        Args:
            data: Query results
            chart_type: Type of chart
            
        Returns:
            Chart configuration dict or None
        """
        if not data:
            return None
        
        try:
            if chart_type == 'bar':
                return self._format_bar_chart(data)
            elif chart_type == 'pie':
                return self._format_pie_chart(data)
            elif chart_type == 'line':
                return self._format_line_chart(data)
            elif chart_type == 'scatter':
                return self._format_scatter_chart(data)
            else:
                return self._format_table(data)
        except Exception as e:
            print(f"Error formatting chart: {e}")
            return None
    
    def _format_bar_chart(self, data: List[Dict]) -> Dict[str, Any]:
        """Format data for bar chart"""
        # Assume first column is label, second is value
        keys = list(data[0].keys())
        
        # Try to find label and value columns
        label_col = keys[0]
        value_col = keys[1] if len(keys) > 1 else keys[0]
        
        labels = [str(row[label_col]) for row in data]
        values = [float(row[value_col]) if row[value_col] is not None else 0 for row in data]
        
        return {
            "type": "bar",
            "data": {
                "labels": labels,
                "datasets": [{
                    "label": value_col.replace('_', ' ').title(),
                    "data": values,
                    "backgroundColor": "rgba(59, 130, 246, 0.8)"
                }]
            },
            "options": {
                "responsive": True,
                "indexAxis": "y" if len(labels) > 5 else "x"  # Horizontal if many items
            }
        }
    
    def _format_pie_chart(self, data: List[Dict]) -> Dict[str, Any]:
        """Format data for pie chart"""
        keys = list(data[0].keys())
        label_col = keys[0]
        value_col = keys[1] if len(keys) > 1 else keys[0]
        
        labels = [str(row[label_col]) for row in data]
        values = [float(row[value_col]) if row[value_col] is not None else 0 for row in data]
        
        return {
            "type": "pie",
            "data": {
                "labels": labels,
                "datasets": [{
                    "data": values,
                    "backgroundColor": [
                        "rgba(59, 130, 246, 0.8)",
                        "rgba(16, 185, 129, 0.8)",
                        "rgba(251, 191, 36, 0.8)",
                        "rgba(239, 68, 68, 0.8)",
                        "rgba(139, 92, 246, 0.8)"
                    ]
                }]
            }
        }
    
    def _format_line_chart(self, data: List[Dict]) -> Dict[str, Any]:
        """Format data for line chart"""
        keys = list(data[0].keys())
        label_col = keys[0]
        value_col = keys[1] if len(keys) > 1 else keys[0]
        
        labels = [str(row[label_col]) for row in data]
        values = [float(row[value_col]) if row[value_col] is not None else 0 for row in data]
        
        return {
            "type": "line",
            "data": {
                "labels": labels,
                "datasets": [{
                    "label": value_col.replace('_', ' ').title(),
                    "data": values,
                    "borderColor": "rgba(59, 130, 246, 1)",
                    "tension": 0.4
                }]
            }
        }
    
    def _format_scatter_chart(self, data: List[Dict]) -> Dict[str, Any]:
        """Format data for scatter plot"""
        keys = list(data[0].keys())
        
        # Assume columns are x, y values
        x_col = keys[0] if len(keys) > 0 else None
        y_col = keys[1] if len(keys) > 1 else None
        
        points = [{
            "x": float(row[x_col]) if row[x_col] is not None else 0,
            "y": float(row[y_col]) if row[y_col] is not None else 0
        } for row in data]
        
        return {
            "type": "scatter",
            "data": {
                "datasets": [{
                    "label": f"{y_col} vs {x_col}",
                    "data": points,
                    "backgroundColor": "rgba(59, 130, 246, 0.8)"
                }]
            }
        }
    
    def _format_table(self, data: List[Dict]) -> Dict[str, Any]:
        """Format data as table"""
        if not data:
            return {"type": "table", "data": []}
        
        columns = list(data[0].keys())
        
        return {
            "type": "table",
            "columns": columns,
            "data": data
        }


# Create chart generator instance
chart_generator = ChartGenerator()