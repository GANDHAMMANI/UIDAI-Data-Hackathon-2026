"""
Enhanced Chart Data Generator
Generates chart configurations for frontend rendering
"""

def determine_chart_type(question: str, data: list, column_count: int) -> str:
    """
    Intelligently determine the best chart type based on question and data
    """
    question_lower = question.lower()
    
    # Keywords for different chart types
    comparison_keywords = ['compare', 'vs', 'versus', 'difference', 'contrast']
    ranking_keywords = ['top', 'bottom', 'best', 'worst', 'highest', 'lowest', 'ranking']
    distribution_keywords = ['distribution', 'breakdown', 'share', 'percentage', 'proportion']
    trend_keywords = ['trend', 'over time', 'timeline', 'history', 'change']
    
    # Determine based on keywords
    if any(keyword in question_lower for keyword in comparison_keywords):
        return 'bar'  # Comparison chart
    elif any(keyword in question_lower for keyword in ranking_keywords):
        return 'horizontalBar'  # Ranking chart
    elif any(keyword in question_lower for keyword in distribution_keywords):
        return 'pie' if len(data) <= 10 else 'doughnut'
    elif any(keyword in question_lower for keyword in trend_keywords):
        return 'line'
    
    # Determine based on data structure
    if column_count == 2:
        # Two columns: likely label + value
        if len(data) <= 5:
            return 'bar'
        elif len(data) <= 10:
            return 'horizontalBar'
        else:
            return 'table'  # Too many for chart
    elif column_count >= 3:
        # Multiple values per item
        if len(data) <= 10:
            return 'bar'  # Grouped bar chart
        else:
            return 'table'
    
    # Default
    return 'table'


def format_for_chart(question: str, query_result: list) -> dict:
    """
    Format SQL query results into Chart.js compatible format
    
    Args:
        question: User's original question
        query_result: List of tuples/dicts from SQL query
        
    Returns:
        dict: Chart.js configuration or None if not suitable for charting
    """
    if not query_result or len(query_result) == 0:
        return None
    
    # Convert to list of dicts if needed
    if isinstance(query_result[0], tuple):
        # Can't easily determine column names from tuples
        # Skip chart generation for now
        return None
    
    # Get column names
    first_row = query_result[0]
    if not isinstance(first_row, dict):
        return None
    
    columns = list(first_row.keys())
    column_count = len(columns)
    
    # Need at least 2 columns (label + value)
    if column_count < 2:
        return None
    
    # Determine chart type
    chart_type = determine_chart_type(question, query_result, column_count)
    
    if chart_type == 'table':
        return None  # Too complex for chart, return None
    
    # Extract data
    labels = []
    datasets = []
    
    # Identify label column (usually first text column or column named 'state', 'district', etc.)
    label_column = None
    value_columns = []
    
    for col in columns:
        col_lower = col.lower()
        if col_lower in ['state', 'district', 'name', 'label', 'category']:
            label_column = col
        elif col_lower not in ['z_score', 'bio_ratio', 'count', 'total', 'avg', 'enrollments', 'updates', 'ratio']:
            # If no explicit label column found, use first column
            if label_column is None and isinstance(first_row[col], str):
                label_column = col
        
        # Value columns (numeric)
        if isinstance(first_row[col], (int, float)) and col != label_column:
            value_columns.append(col)
    
    # If no label column identified, use first column
    if label_column is None:
        label_column = columns[0]
    
    # If no value columns, use all non-label columns
    if not value_columns:
        value_columns = [col for col in columns if col != label_column]
    
    # Build labels
    for row in query_result:
        label = str(row[label_column])
        # Truncate long labels
        if len(label) > 30:
            label = label[:27] + '...'
        labels.append(label)
    
    # Build datasets
    colors = [
        'rgba(59, 130, 246, 0.8)',   # Blue
        'rgba(239, 68, 68, 0.8)',     # Red
        'rgba(16, 185, 129, 0.8)',    # Green
        'rgba(251, 191, 36, 0.8)',    # Yellow
        'rgba(139, 92, 246, 0.8)',    # Purple
        'rgba(236, 72, 153, 0.8)',    # Pink
    ]
    
    for idx, col in enumerate(value_columns):
        dataset_data = []
        for row in query_result:
            value = row[col]
            # Handle None values
            if value is None:
                value = 0
            # Round floats
            if isinstance(value, float):
                value = round(value, 2)
            dataset_data.append(value)
        
        # Format label nicely
        dataset_label = col.replace('_', ' ').title()
        
        datasets.append({
            'label': dataset_label,
            'data': dataset_data,
            'backgroundColor': colors[idx % len(colors)],
            'borderColor': colors[idx % len(colors)].replace('0.8', '1'),
            'borderWidth': 2
        })
    
    # Build chart config
    chart_config = {
        'type': chart_type,
        'data': {
            'labels': labels,
            'datasets': datasets
        },
        'options': {
            'responsive': True,
            'maintainAspectRatio': False,
            'plugins': {
                'legend': {
                    'display': len(datasets) > 1,
                    'position': 'top'
                },
                'title': {
                    'display': True,
                    'text': _generate_chart_title(question)
                }
            },
            'scales': {}
        }
    }
    
    # Add scales based on chart type
    if chart_type in ['bar', 'horizontalBar', 'line']:
        if chart_type == 'horizontalBar':
            chart_config['options']['indexAxis'] = 'y'
            chart_config['options']['scales'] = {
                'x': {
                    'beginAtZero': True
                }
            }
        else:
            chart_config['options']['scales'] = {
                'y': {
                    'beginAtZero': True
                }
            }
    
    return chart_config


def _generate_chart_title(question: str) -> str:
    """Generate a nice chart title from the question"""
    # Remove question words
    title = question
    remove_words = ['what', 'show', 'me', 'the', 'please', 'can you', 'could you', '?']
    
    for word in remove_words:
        title = title.replace(word, '')
    
    # Capitalize and clean
    title = ' '.join(title.split())
    if len(title) > 60:
        title = title[:57] + '...'
    
    return title.strip().title()


def should_generate_chart(question: str, result_count: int) -> bool:
    """
    Determine if a chart should be generated for this query
    
    Args:
        question: User's question
        result_count: Number of rows in result
        
    Returns:
        bool: True if chart should be generated
    """
    question_lower = question.lower()
    
    # Always generate charts for these keywords
    chart_keywords = [
        'compare', 'show', 'top', 'bottom', 'ranking', 'list',
        'distribution', 'breakdown', 'vs', 'versus', 'trend'
    ]
    
    if any(keyword in question_lower for keyword in chart_keywords):
        # But only if reasonable number of results
        if 2 <= result_count <= 50:
            return True
    
    # Don't generate charts for these
    no_chart_keywords = [
        'how many', 'count', 'total', 'sum', 'average',
        'explain', 'why', 'what is', 'define'
    ]
    
    if any(keyword in question_lower for keyword in no_chart_keywords):
        return False
    
    # Default: generate if between 2-20 results
    return 2 <= result_count <= 20